import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Image } from './Image.entity';

@Entity()
export class ImageVariableRequirement {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => Image, defaultRaw: `gen_random_uuid()` })
  image!: Image & Opt;

  @Property({ length: -1 })
  title!: string;

  @Property({ length: -1 })
  name!: string;

  @Property({ length: -1 })
  defaultValue!: string;

  @Property({ length: -1, nullable: true })
  type?: string;
}
