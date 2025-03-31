import { Entity, OneToOne, type Opt, Property } from '@mikro-orm/core';
import { Resource } from './Resource';

@Entity()
export class ResourceDockerImage {
  @OneToOne({
    entity: () => Resource,
    fieldName: 'id',
    primary: true,
    defaultRaw: `gen_random_uuid()`,
  })
  id!: Resource & Opt;

  @Property({ length: -1 })
  image!: string;

  @Property({ length: -1 })
  tag!: string;

  @Property({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  dockerId!: string & Opt;
}
