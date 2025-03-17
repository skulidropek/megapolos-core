import { knex } from '../corePostgres';
import { DbTable, DbUserTable, DbmsTable } from '../modules/models/tables';
import BaseDbms from './BaseDbms';
import BaseRepository from './BaseRepository';

class DbUser extends BaseRepository<DbUserTable> {
  getTable(): string {
    return 'db_user';
  }

  async getDbs(): Promise<DbTable[]> {
    return knex.select().from('db').
      leftJoin('db_db_user', 'db.id', 'db_db_user.db_id').
      where('db_db_user.db_user_id', this.id);
  }

  async getDbms(): Promise<DbmsTable> {
    const data = await this.getData();
    return new BaseDbms(this.ctx, data.dbms_id).getData();
  }
}

export default DbUser;