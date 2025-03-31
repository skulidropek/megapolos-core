import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Container } from './Container.entity';

@Entity()
export class ContainerVariable {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => Container })
  container!: Container;

  @Property({ length: -1 })
  name!: string;

  @Property({ length: -1 })
  value!: string;

  @Property({ length: -1 })
  type!: string;
}
