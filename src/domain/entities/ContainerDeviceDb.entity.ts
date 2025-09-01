import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Container } from './Container.entity';
import { Device } from './Device.entity';

@Entity()
export class ContainerDeviceDb {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => Container, defaultRaw: `gen_random_uuid()` })
  container!: Container & Opt;

  @ManyToOne({ entity: () => Device, defaultRaw: `gen_random_uuid()` })
  device!: Device & Opt;

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
