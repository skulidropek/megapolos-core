import { Entity, ManyToOne, type Opt, Property } from '@mikro-orm/core';
import { Container } from './Container';

@Entity()
export class DockerRegistry {
  @Property({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1 })
  name!: string;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  updateDate?: Date;

  @Property({ length: -1, nullable: true })
  host?: string;

  @Property({ length: -1, nullable: true })
  user?: string;

  @Property({ length: -1, nullable: true })
  password?: string;

  @ManyToOne({ entity: () => Container, nullable: true })
  container?: Container;

  @Property({ type: 'boolean', nullable: true })
  isDefault?: boolean = false;
}
