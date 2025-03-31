import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { App } from './App';

@Entity()
export class Repository {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1 })
  url!: string;

  @Property({ length: -1, nullable: true })
  user?: string;

  @Property({ length: -1, nullable: true })
  password?: string;

  @Property({ nullable: true })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  updateDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  removeDate?: Date;

  @Property({ length: -1, nullable: true })
  name?: string;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  lastFetchDate?: Date;

  @ManyToOne({ entity: () => App, nullable: true })
  app?: App;

  @Property({ length: -1, nullable: true })
  microserviceName?: string;

  @Property({ length: -1, nullable: true })
  title?: string;
}
