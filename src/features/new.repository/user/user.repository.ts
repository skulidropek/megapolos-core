import { User } from '../../../domain/entities/User.entity';
import { UserGroupLink } from '../../../domain/entities/UserGroupLink.entity';
import { makeEm } from '../../db/mikro-orm';
import { RequiredEntityData } from '@mikro-orm/core';
import BaseRepo from '../base.repository';
import { GroupUserPrivilege } from '../../../domain/entities/GroupUserPrivilege.entity';

export default class UserRepo extends BaseRepo<User> {
  static rootRoleId?: string;

  get entityClass() {
    return User;
  }

  // OVERRIDE
  async create(entity: RequiredEntityData<User>): Promise<User> {
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

  // OTHER
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
}
