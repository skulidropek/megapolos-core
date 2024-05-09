import { DbmsTable, LogTable } from '../modules/models/tables';
import BaseRepository from './BaseRepository';

class Log extends BaseRepository<LogTable> {
  getTable(): string {
    return 'log';
  }
}

export default Log;