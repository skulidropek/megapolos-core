import BaseRepo from './base.repository';
import { Domain } from '../../domain/entities/Domain.entity';

export default class DomainRepo extends BaseRepo<Domain> {
  get entityClass() {
    return Domain;
  }
}
