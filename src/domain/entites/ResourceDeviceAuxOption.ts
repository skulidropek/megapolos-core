import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Device } from './Device';
import { Resource } from './Resource';

@Entity()
export class ResourceDeviceAuxOption {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => Resource, defaultRaw: `gen_random_uuid()` })
  resource!: Resource & Opt;

  @ManyToOne({ entity: () => Device, defaultRaw: `gen_random_uuid()` })
  device!: Device & Opt;

  @Property({ length: -1 })
  deviceOptionName!: string;

  @Property({ length: -1 })
  resourceOptionValue!: string;
}
