import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Image } from './Image';

@Entity()
export class ImageEnvOption {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => Image, defaultRaw: `gen_random_uuid()` })
  image!: Image & Opt;

  @Property({ length: -1 })
  imageEnvName!: string;

  @Property({ length: -1 })
  imageEnvValue!: string;
}
