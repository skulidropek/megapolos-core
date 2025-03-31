import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { DeviceType } from './DeviceType';
import { Driver } from './Driver';
import { Node } from './Node';
import { Volume } from './Volume';

@Entity()
export class Device {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1, unique: 'device_name_key' })
  name!: string;

  @ManyToOne({ entity: () => DeviceType, defaultRaw: `gen_random_uuid()` })
  deviceType!: DeviceType & Opt;

  @ManyToOne({ entity: () => Node, defaultRaw: `gen_random_uuid()` })
  node!: Node & Opt;

  @Property({ type: 'integer' })
  isVirtual: number & Opt = 0;

  @Property({ type: 'uuid', nullable: true })
  virtualDeviceContainerId?: string;

  @ManyToOne({ entity: () => Driver, defaultRaw: `gen_random_uuid()` })
  driver!: Driver & Opt;

  @Property({ length: -1, nullable: true })
  url?: string;

  @Property({ type: 'string', length: -1 })
  lifeStatus: string & Opt = 'running';

  @ManyToOne({ entity: () => Volume, nullable: true })
  backupVolume?: Volume;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  updateDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  removeDate?: Date;
}
