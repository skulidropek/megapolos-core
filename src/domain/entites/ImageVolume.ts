import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Image } from './Image';

@Entity()
export class ImageVolume {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1 })
  name!: string;

  @ManyToOne({ entity: () => Image, defaultRaw: `gen_random_uuid()` })
  image!: Image & Opt;

  @Property({ length: -1 })
  innerPath!: string;

  @Property({ nullable: true })
  isDynamic?: number;
}
