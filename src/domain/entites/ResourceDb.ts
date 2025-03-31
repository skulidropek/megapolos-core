import { Entity, OneToOne, type Opt, Property } from '@mikro-orm/core';
import { Resource } from './Resource';

@Entity()
export class ResourceDb {
  @OneToOne({
    entity: () => Resource,
    fieldName: 'id',
    primary: true,
    defaultRaw: `gen_random_uuid()`,
  })
  id!: Resource & Opt;

  @Property({ length: -1 })
  dbHost!: string;

  @Property({ length: -1 })
  dbName!: string;

  @Property({ length: -1 })
  dbUser!: string;

  @Property({ length: -1 })
  dbPassword!: string;

  @Property({ length: -1 })
  dbProtocol!: string;
}
