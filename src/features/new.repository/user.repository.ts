import { BaseRepo } from './base.repository';
import { User } from '../../domain/entities/User.entity';
import { UserGroupLink } from '../../domain/entities/UserGroupLink.entity';
import { makeEm } from '../db/mikro-orm';
import { RequiredEntityData } from '@mikro-orm/core';

export class UserRepo extends BaseRepo<User> {
  get entityClass() {
    return User;
  }

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
}
