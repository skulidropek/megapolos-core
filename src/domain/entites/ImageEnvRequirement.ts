import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Image } from './Image';

@Entity()
export class ImageEnvRequirement {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => Image, defaultRaw: `gen_random_uuid()` })
  image!: Image & Opt;

  @Property({ length: -1 })
  name!: string;

  @Property({ length: -1 })
  envName!: string;

  @Property({ length: -1 })
  envDefaultValue!: string;

  @Property({ length: -1, nullable: true })
  type?: string;
}
