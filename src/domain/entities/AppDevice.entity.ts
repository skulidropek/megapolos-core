import { Entity, ManyToOne, type Opt, PrimaryKey } from '@mikro-orm/core';
import { App } from './App.entity';
import { Device } from './Device.entity';

@Entity()
export class AppDevice {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => App, defaultRaw: `gen_random_uuid()` })
  app!: App & Opt;

  @ManyToOne({ entity: () => Device, defaultRaw: `gen_random_uuid()` })
  device!: Device & Opt;
}
