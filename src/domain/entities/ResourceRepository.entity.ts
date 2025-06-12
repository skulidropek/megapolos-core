import { Entity, OneToOne, type Opt, Property } from '@mikro-orm/core';
import { Resource } from './Resource.entity';

@Entity()
export class ResourceRepository {
  @OneToOne({
    entity: () => Resource,
    fieldName: 'id',
    primary: true,
    defaultRaw: `gen_random_uuid()`,
  })
  id!: Resource & Opt;

  @Property({ length: -1 })
  repository!: string;
}
