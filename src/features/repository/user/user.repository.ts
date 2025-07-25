import jwt from 'jsonwebtoken';
import { User } from '../../../domain/entities/User.entity';
import { UserGroupLink } from '../../../domain/entities/UserGroupLink.entity';
import { makeEm, mem } from '../../db/mikro-orm';
import { RequiredEntityData } from '@mikro-orm/core';
import BaseRepo from '../base.repository';
import { GroupUserPrivilege } from '../../../domain/entities/GroupUserPrivilege.entity';
import UserGroupRepo from './user.group.repository';
import { GroupUser } from '../../../domain/entities/GroupUser.entity';
import UserGroupPrivilegeRepo from './user.group.privilege.repository';
import config from '../../../domain/config/config';

export default class UserRepo extends BaseRepo<User> {
  static rootRoleId?: string;

  get entityClass() {
    return User;
  }

  // OVERRIDE
  async create(entity: RequiredEntityData<User>): Promise<User> {
    TODO: 'Дублирует создания группы';
    // const groupUser = await new UserGroupRepo(this.ctx).create({
    //   name: entity.name,
    // });
    // console.log('GROUPUSER', groupUser);
    // entity.groupUser = groupUser.id;
    const created = await super.create(entity);
    const em = makeEm();
    const userGroupLink = em.create(UserGroupLink, {
      user: created.id,
      groupUser: created.groupUser.id,
    });
    await em.persistAndFlush(userGroupLink);
    return created;
  }

  async delete(): Promise<boolean> {
    const em = makeEm();
    await em.nativeDelete(UserGroupLink, { user: this.id });
    return super.delete();
  }

  // OTHER
  async amIRootUser(): Promise<boolean> {
    const user = await makeEm().findOneOrFail(
      User,
      { id: this.id },
      { populate: ['groups'] }
    );

    return user.groups
      .getItems()
      .some((group) => group.id == UserRepo.rootRoleId);
  }

  async getPrivileges(): Promise<GroupUserPrivilege[]> {
    const user = await makeEm().findOneOrFail(
      User,
      { id: this.id },
      { populate: ['groups.privileges'] }
    );

    return user.groups
      .getItems()
      .flatMap((group) => group.privileges.getItems());
  }

  async checkGroupUserLinks() {
    const users = await this.getAll();
    const links = await makeEm().find(UserGroupLink, {});

    const toInsert = [];
    for (const user of users) {
      if (!links.find((l) => l.user.id == user.id)) {
        toInsert.push({
          user: user.id,
          groupUser: user.groupUser.id,
        });
      }
    }

    if (toInsert.length) {
      const em = makeEm();
      await em.insertMany(UserGroupLink, toInsert);
      await em.flush();
    }
  }

  async createRootGroup(): Promise<GroupUser> {
    const rootGroup = await new UserGroupRepo(this.ctx).getByFields({
      name: 'root',
    });
    if (rootGroup.length) {
      UserRepo.rootRoleId = rootGroup[0].id;
      return rootGroup[0];
    }
    const group = await new UserGroupRepo(this.ctx).create({ name: 'root' });
    UserRepo.rootRoleId = group.id;
    return group;
  }

  async createRootUser(): Promise<UserRepo> {
    const rootGroup = await this.createRootGroup();
    let rootUser = (await this.getByGroupName('root'))[0];

    if (!rootUser) {
      rootUser = await this.create({
        name: 'root',
        groupUser: rootGroup.id,
        osUserId: '',
      });
    }

    // Create root privileges
    let privileges = await new UserGroupPrivilegeRepo(this.ctx).getByFields({
      groupUser: rootGroup.id,
    });
    if (
      !privileges.length ||
      !privileges.find(
        (p) => p.objectName == '*' && p.objectId == '*' && p.action == '*'
      )
    ) {
      await new UserGroupPrivilegeRepo(this.ctx).create({
        groupUser: rootGroup.id,
        objectName: '*',
        objectId: '*',
        action: '*',
      });
    }

    UserRepo.rootRoleId = rootGroup.id;
    return new UserRepo(this.ctx, rootUser.id);
  }

  async getUsersWithToken(): Promise<(User & { token?: string })[]> {
    const users = await this.getAll();
    return Promise.all(
      users.map((user) => new UserRepo(this.ctx, user.id).getDataWithToken())
    );
  }

  async getDataWithToken(): Promise<User & { token?: string }> {
    const result: User & { token?: string } = await this.getEntity();
    result.token = jwt.sign({ id: result.id }, config.secret);
    return result;
  }

  createToken(): string {
    return jwt.sign({ id: this.id }, config.secret);
  }

  async getGroup(): Promise<GroupUser> {
    const data = await this.getEntity();
    return new UserGroupRepo(this.ctx, data.groupUser.id).getEntity();
  }

  async getByGroupName(groupName: string): Promise<User[]> {
    return (
      await makeEm().find(
        GroupUser,
        {
          name: groupName,
        },
        { populate: ['users'] }
      )
    ).flatMap((group) => group.users.getItems());
  }

  async addUserToGroup(group_id: string): Promise<boolean> {
    if (!(await this.amIRootUser())) {
      this._throwAccessDenied();
    }

    await mem(async (em) => {
      const user = em.getReference(User, this.id);
      const group = em.getReference(GroupUser, group_id);
      user.groups.add(group);
      await em.persistAndFlush(user);
    });
    return true;
  }
}
