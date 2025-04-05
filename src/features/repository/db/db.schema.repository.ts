import { DbSchemaEntity } from '../../../domain/entities/DbSchema.entity';
import BaseRepo from '../base.repository';

export default class DbSchemaRepo extends BaseRepo<DbSchemaEntity> {
  get entityClass() {
    return DbSchemaEntity;
  }
}
