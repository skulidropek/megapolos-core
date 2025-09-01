import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Device } from './Device.entity';

@Entity()
export class Resource {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => Device, defaultRaw: `gen_random_uuid()` })
  device!: Device & Opt;

  @Property({ length: -1 })
  name!: string;

  @Property({ length: -1 })
  resourceType!: string;

  @Property({ length: -1 })
  resourceKind!: string;
}
