import BaseRepo from '../base.repository';
import { GroupUser } from '../../../domain/entities/GroupUser.entity';
import { makeEm } from '../../db/mikro-orm';
import { User } from '../../../domain/entities/User.entity';

export default class UserGroupRepo extends BaseRepo<GroupUser> {
  get entityClass() {
    return GroupUser;
  }

  async addUser(userId: string): Promise<boolean> {
    await this.checkActionAccess('*');
    await makeEm().getDriver().nativeInsert('user_group_link', {
      group_user_id: this.id,
      user_id: userId,
    });
    return true;
  }

  async removeUser(userId: string): Promise<boolean> {
    await this.checkActionAccess('*');
    await makeEm().getDriver().nativeDelete('user_group_link', {
      group_user_id: this.id,
      user_id: userId,
    });
    return true;
  }
}
