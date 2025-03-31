import { Entity, ManyToOne, type Opt, PrimaryKey } from '@mikro-orm/core';
import { Container } from './Container.entity';
import { Device } from './Device.entity';

@Entity()
export class ContainerDevice {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => Container, defaultRaw: `gen_random_uuid()` })
  container!: Container & Opt;

  @ManyToOne({ entity: () => Device, defaultRaw: `gen_random_uuid()` })
  device!: Device & Opt;
}
