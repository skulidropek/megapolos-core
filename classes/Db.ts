import { knex } from '../corePostgres';
import { DbTable, DbUserTable, DbmsTable } from '../modules/models/tables';
import BaseDbms from './BaseDbms';
import BaseRepository from './BaseRepository';

class Db extends BaseRepository<DbTable> {
  getTable(): string {
    return 'db';
  }

  getUsers(): Promise<DbUserTable[]> {
    return knex.select().from('db_user').
      leftJoin('db_db_user', 'db_user.id', 'db_db_user.db_user_id').
      where('db_db_user.db_id', this.id);
  }

  async getDbms(): Promise<DbmsTable> {
    const data = await this.getData();
    return new BaseDbms(this.ctx, data.dbms_id).getData();
  }
}

export default Db;