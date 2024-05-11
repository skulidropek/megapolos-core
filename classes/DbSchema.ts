import { DbSchemaTable } from '../modules/models/tables';
import BaseRepository from './BaseRepository';

class DbSchema extends BaseRepository<DbSchemaTable> {
  getTable(): string {
    return 'db_schema';
  }
}

export default DbSchema;