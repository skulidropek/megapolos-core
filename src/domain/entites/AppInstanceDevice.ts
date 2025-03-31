import { Entity, ManyToOne, type Opt, PrimaryKey } from '@mikro-orm/core';
import { AppInstance } from './AppInstance';
import { Device } from './Device';

@Entity()
export class AppInstanceDevice {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => AppInstance, defaultRaw: `gen_random_uuid()` })
  appInstance!: AppInstance & Opt;

  @ManyToOne({ entity: () => Device, defaultRaw: `gen_random_uuid()` })
  device!: Device & Opt;
}
