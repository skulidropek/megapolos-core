import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Container } from './Container';
import { Device } from './Device';
import { Image } from './Image';

@Entity()
export class DeviceBackup {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1, nullable: true })
  name?: string;

  @ManyToOne({ entity: () => Device, defaultRaw: `gen_random_uuid()` })
  device!: Device & Opt;

  @Property({ length: -1 })
  deviceName!: string;

  @ManyToOne({ entity: () => Container, nullable: true })
  container?: Container;

  @ManyToOne({ entity: () => Image, nullable: true })
  image?: Image;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  updateDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  removeDate?: Date;
}
