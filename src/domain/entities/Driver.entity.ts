import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { App } from './App.entity';

@Entity()
export class Driver {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1, unique: 'driver_name_key' })
  name!: string;

  @ManyToOne({ entity: () => App, defaultRaw: `gen_random_uuid()` })
  app!: App & Opt;
}
