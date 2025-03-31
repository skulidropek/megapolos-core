import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Container } from './Container';
import { Volume } from './Volume';

@Entity()
export class ContainerVolume {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1 })
  name!: string;

  @ManyToOne({ entity: () => Container, defaultRaw: `gen_random_uuid()` })
  container!: Container & Opt;

  @ManyToOne({ entity: () => Volume, defaultRaw: `gen_random_uuid()` })
  volume!: Volume & Opt;

  @Property({ length: -1 })
  innerPath!: string;

  @Property({ nullable: true })
  isDynamic?: number;
}
