import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Container } from './Container';

@Entity()
export class ContainerEnvOption {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => Container, defaultRaw: `gen_random_uuid()` })
  container!: Container & Opt;

  @Property({ length: -1 })
  containerEnvName!: string;

  @Property({ length: -1 })
  containerEnvValue!: string;
}
