import { DbBackupTable, DbmsTable } from '../modules/models/tables';
import BaseRepository from './BaseRepository';

class DbBackup extends BaseRepository<DbBackupTable> {
  getTable(): string {
    return 'db_backup';
  }
}

export default DbBackup;