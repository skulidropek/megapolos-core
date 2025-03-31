import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Container } from './Container';
import { Device } from './Device';

@Entity()
export class ContainerDeviceCertificate {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => Container, defaultRaw: `gen_random_uuid()` })
  container!: Container & Opt;

  @ManyToOne({ entity: () => Device, defaultRaw: `gen_random_uuid()` })
  device!: Device & Opt;

  @Property({ length: -1 })
  privateKeyPath!: string;

  @Property({ length: -1 })
  publicKeyPath!: string;
}
