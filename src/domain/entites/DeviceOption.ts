import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Device } from './Device';

@Entity()
export class DeviceOption {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => Device, defaultRaw: `gen_random_uuid()` })
  device!: Device & Opt;

  @Property({ length: -1 })
  deviceOptionName!: string;

  @Property({ length: -1 })
  deviceOptionValue!: string;
}
