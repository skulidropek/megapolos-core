import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Device } from './Device.entity';
import { Image } from './Image.entity';

@Entity()
export class ImageDeviceAuxOption {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => Image, defaultRaw: `gen_random_uuid()` })
  image!: Image & Opt;

  @ManyToOne({ entity: () => Device, defaultRaw: `gen_random_uuid()` })
  device!: Device & Opt;

  @Property({ length: -1 })
  deviceOptionName!: string;

  @Property({ length: -1 })
  imageOptionValue!: string;
}
