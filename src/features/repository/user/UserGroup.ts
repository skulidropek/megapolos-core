import { GroupUserTable } from '../../db/tables';
import BaseRepository from '../BaseRepository';

class UserGroup extends BaseRepository<GroupUserTable> {
  getTable(): string {
    return 'group_user';
  }
}

export default UserGroup;
