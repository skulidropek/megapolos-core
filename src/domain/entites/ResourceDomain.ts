import { Entity, OneToOne, type Opt, Property } from '@mikro-orm/core';
import { Resource } from './Resource';

@Entity()
export class ResourceDomain {
  @OneToOne({
    entity: () => Resource,
    fieldName: 'id',
    primary: true,
    defaultRaw: `gen_random_uuid()`,
  })
  id!: Resource & Opt;

  @Property({ length: -1 })
  domain!: string;

  @Property({ type: 'integer' })
  isSsl: number & Opt = 0;
}
