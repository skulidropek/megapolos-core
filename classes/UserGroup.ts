import { megapolosPath } from '..';
import { GroupUserTable } from '../modules/models/tables';
import simpleGit from 'simple-git';
import fse from 'fs-extra';
import BaseRepository from './BaseRepository';

class UserGroup extends BaseRepository<GroupUserTable> {
  getTable(): string {
    return 'group_user';
  }

}

export default UserGroup;