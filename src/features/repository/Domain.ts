import { DomainTable } from '../db/tables';
import BaseRepository from './BaseRepository';

class Domain extends BaseRepository<DomainTable> {
  getTable(): string {
    return 'domain';
  }
}

export default Domain;
