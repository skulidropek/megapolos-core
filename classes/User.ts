import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import {
  GroupUserPrivilegeTable,
  GroupUserTable,
  UserTable,
} from '../modules/models/tables';

const exec = promisify(require('child_process').exec);

import config from '../config/config';
import { knex } from '../corePostgres';
import EventsObserver from '../modules/events/eventsObserver';
import BaseRepository from './BaseRepository';
import UserGroup from './UserGroup';
import UserGroupPrivilege from './UserGroupPrivilege';

class User extends BaseRepository<UserTable> {
  static rootRoleId?: string;

  getTable(): string {
    return 'user';
  }

  async amIRootUser(): Promise<boolean> {
    const roles = await knex('group_user').select('group_user.*')
      .innerJoin('user_group_link', 'group_user.id', 'user_group_link.group_user_id')
      .where('user_group_link.user_id', this.ctx.user.id);
    return roles.some((role) => role.id == User.rootRoleId);
  }

  async create(data: Partial<UserTable>): Promise<UserTable> {
    let linuxUserId = '';

    // Создаём группу пользователя, если она не указана
    if (!data.group_user_id) {
      const group = await new UserGroup(this.ctx).create({ name: data.name! });
      data.group_user_id = group.id;
    }

    // Создаём пользователя
    const user = await super.create({
      ...data,
      os_user_id: linuxUserId,
    });

    // Создаём ссылку на группу пользователя
    await knex('user_group_link').insert({
      user_id: user.id,
      group_user_id: data.group_user_id,
    });

    return user;
  }

  async checkGroupUserLinks() {
    const users = await this.getAll();
    const links = await knex('user_group_link');

    const toInsert = [];
    for (const user of users) {
      console.log(user.id, user.group_user_id);
      if (!links.find((l) => l.user_id == user.id)) {
        console.log('insert', user.id, user.group_user_id);
        toInsert.push({
          user_id: user.id,
          group_user_id: user.group_user_id,
        });
      }
    }

    if (toInsert.length) {
      await knex('user_group_link').insert(toInsert);
    }
  }

  async createRootGroup(): Promise<GroupUserTable> {
    const rootGroup = await new UserGroup(this.ctx).getByFields({ name: 'root' });
    if (rootGroup.length) {
      User.rootRoleId = rootGroup[0].id;
      return rootGroup[0];
    }
    const group = await new UserGroup(this.ctx).create({ name: 'root' });
    User.rootRoleId = group.id;
    return group;
  }

  async createRootUser(): Promise<User> {
    const rootGroup = await this.createRootGroup();
    let rootUser = (await this.getByGroupName('root'))[0];

    if (!rootUser) {
      rootUser = await this.create({
        name: 'root',
        group_user_id: rootGroup.id,
        os_user_id: '',
      });
    }

    // Create root privileges
    let privileges = await new UserGroupPrivilege(this.ctx).getByFields({
      group_user_id: rootGroup.id,
    });
    if (
      !privileges.length
      || !privileges.find((p) =>
        p.object_name == '*' && p.object_id == '*' && p.action == '*',
      )
    ) {
      await new UserGroupPrivilege(this.ctx).create({
        group_user_id: rootGroup.id,
        object_name: '*',
        object_id: '*',
        action: '*',
      });
    }

    User.rootRoleId = rootGroup.id;
    return new User(this.ctx, rootUser.id);
  }

  async getUsersWithToken(): Promise<(UserTable & { token?: string })[]> {
    const users = await this.getAll();
    return Promise.all(
      users.map((user) => new User(this.ctx, user.id).getDataWithToken()),
    );
  }

  async getDataWithToken(): Promise<UserTable & { token?: string }> {
    const result: UserTable & { token?: string } = await this.getData();
    result.token = jwt.sign({ id: result.id }, config.secret);
    return result;
  }

  createToken(): string {
    return jwt.sign({ id: this.id }, config.secret);
  }

  async getGroup(): Promise<GroupUserTable> {
    const data = await this.getData();
    return new UserGroup(this.ctx, data.group_user_id).getData();
  }

  async getPrivileges(): Promise<GroupUserPrivilegeTable[]> {
    return knex
      .select('group_user_privilege.*')
      .from('group_user_privilege')
      .join(
        'group_user',
        'group_user.id',
        'group_user_privilege.group_user_id',
      )
      .join(
        'user_group_link',
        'user_group_link.group_user_id',
        'group_user.id',
      )
      .join(
        'user',
        'user.id',
        'user_group_link.user_id',
      )
      .where('user.id', this.id);
  }

  async getByGroupName(groupName: string): Promise<UserTable[]> {
    const group = await new UserGroup(this.ctx).getByFields({ name: groupName });
    if (!group.length) {
      return [];
    }
    return this.getByFields({ group_user_id: group[0].id });
  }

  async addUserToGroup(group_id: string): Promise<boolean> {
    if (!await this.amIRootUser()) {
      this._throwAccessDenied();
    }

    await knex('user_group_link').insert({
      user_id: this.id,
      group_user_id: group_id,
    });
    return true;
  }

  async delete(): Promise<boolean> {
    const data = await this.getData();
    await super.delete();

    if (data.os_user_id) {
      try {
        // await exec(`userdel -r ${this.id.replace(/-/g, '')}`);
      } catch (e) {
        console.trace(e);
        EventsObserver.listener({ type: 'error', data: e });
      }
    }

    return true;
  }
}

export default User;
