import { knex } from '../corePostgres';
import { DbmsTable } from '../modules/models/tables';
import BaseDbms from './BaseDbms';
import PostgresDmbs from './PostgresDbms';

class Dbms {
  static async getById(id: string):Promise<BaseDbms> {
    const dbms: DbmsTable = await knex.select().from('dbms').where('id', id).first();
    if (dbms?.type === 'postgres') {
      return new PostgresDmbs(dbms);
    }
    throw new Error('Dbms type not found');
  }

  static async getByType(type: string):Promise<BaseDbms> {
    if (type === 'postgres') {
      return new PostgresDmbs();
    }
    throw new Error('Dbms type not found');
  }
}

export default Dbms;