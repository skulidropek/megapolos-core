import { DbSchema } from '../../../domain/entities/DbSchema.entity';
import BaseRepo from '../base.repository';

export default class DbSchemaRepo extends BaseRepo<DbSchema> {
  get entityClass() {
    return DbSchema;
  }
}
