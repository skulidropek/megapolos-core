import BaseRepo from '../base.repository';
import { GroupUser } from '../../../domain/entities/GroupUser.entity';

export default class UserGroupRepo extends BaseRepo<GroupUser> {
  get entityClass() {
    return GroupUser;
  }
}
