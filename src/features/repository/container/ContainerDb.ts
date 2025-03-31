import { ContainerDbTable } from '../../db/tables';
import BaseRepository from '../BaseRepository';
import Db from '../db/Db';
import Container from './Container';
import DbUser from '../db/DbUser';

class ContainerDb extends BaseRepository<ContainerDbTable> {
  getTable(): string {
    return 'container_db';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async checkEntityData(
    entity: Partial<ContainerDbTable>,
    isCreate?: boolean
  ): Promise<boolean> {
    if (entity.container_id) {
      await new Container(this.ctx, entity.container_id).getData();
    }
    if (entity.db_id) {
      await new Db(this.ctx, entity.db_id).getData();
    }
    if (entity.db_user_id) {
      await new DbUser(this.ctx, entity.db_user_id).getData();
    }

    return true;
  }
}

export default ContainerDb;
