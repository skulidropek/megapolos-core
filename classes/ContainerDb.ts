import { megapolosPath } from '..';
import { ContainerDbTable, DomainTable } from '../modules/models/tables';
import simpleGit from 'simple-git';
import fse from 'fs-extra';
import BaseRepository from './BaseRepository';
import Db from './Db';
import Container from './Container';
import DbUser from './DbUser';

class ContainerDb extends BaseRepository<ContainerDbTable> {
  getTable(): string {
    return 'container_db';
  }

  async checkEntityData(entity: Partial<ContainerDbTable>, isCreate?: boolean): Promise<boolean> {
    if (entity.container_id) {
      await new Container(entity.container_id).getData();
    }
    if (entity.db_id) {
      await new Db(entity.db_id).getData();
    }
    if (entity.db_user_id) {
      await new DbUser(entity.db_user_id).getData();
    }

    return true;
  }

}

export default ContainerDb;