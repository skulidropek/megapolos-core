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
  static rootUserId: string | undefined = undefined;

  getTable(): string {
    return 'user';
  }

  static isRootUser(userId: string): boolean {
    return userId == User.rootUserId;
  }

  async create(data: Partial<UserTable>): Promise<UserTable> {
    let linuxUserId = '';
    return super.create({
      ...data,
      os_user_id: linuxUserId,
    });
  }

  async createRootUser(): Promise<User> {
    let admins = await this.getByGroupName('root');

    if (!admins.length) {
      // Create root group
      let rootGroup = (await new UserGroup(this.ctx).getByFields({ name: 'root' }))[0];
      if (!rootGroup) {
        rootGroup = await new UserGroup(this.ctx).create({ name: 'root' });
      }
      await this.create({
        name: 'root',
        group_user_id: rootGroup.id,
        os_user_id: '',
      });


      admins = await this.getByGroupName('root');
    }

    // Create root privileges
    let privileges = await new UserGroupPrivilege(this.ctx).getByFields({
      group_user_id: admins[0].group_user_id,
    });
    if (
      !privileges.length
      || !privileges.find((p) =>
        p.object_name == '*' && p.object_id == '*' && p.action == '*',
      )
    ) {
      await new UserGroupPrivilege(this.ctx).create({
        group_user_id: admins[0].group_user_id,
        object_name: '*',
        object_id: '*',
        action: '*',
      });
    }

    User.rootUserId = admins[0].id;
    return new User(this.ctx, admins[0].id);
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
        'user',
        'user.group_user_id',
        'group_user.id',
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
