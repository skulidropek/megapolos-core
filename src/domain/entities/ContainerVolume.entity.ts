import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Container } from './Container.entity';
import { Volume } from './Volume.entity';

@Entity()
export class ContainerVolume {
  @PrimaryKey({ type: 'uuid' })
  id!: string & Opt;

  @Property({ length: -1 })
  name!: string;

  @ManyToOne({ entity: () => Container })
  container!: Container & Opt;

  @ManyToOne({ entity: () => Volume })
  volume!: Volume & Opt;

  @Property({ length: -1 })
  innerPath!: string;

  @Property({ nullable: true })
  isDynamic?: number;
}
