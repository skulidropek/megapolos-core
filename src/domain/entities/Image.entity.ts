import {
  Entity,
  Enum,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { App } from './App.entity';
import { Repository } from './Repository.entity';

@Entity()
export class Image {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1, unique: 'image_name_key' })
  name!: string;

  @ManyToOne({ entity: () => App, defaultRaw: `gen_random_uuid()` })
  app!: App & Opt;

  @Property({ length: -1 })
  image!: string;

  @Property()
  innerPort!: number;

  @Property({ type: 'integer' })
  hasState: number & Opt = 1;

  @Property({ type: 'string', length: -1 })
  tags: string & Opt = '';

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  updateDate?: Date;

  @Property({ length: -1, nullable: true })
  commitId?: string;

  @ManyToOne({ entity: () => Repository, nullable: true })
  repository?: Repository;

  @Property({ length: -1, nullable: true })
  branch?: string;

  @Enum({ items: () => ImageStatus })
  status: ImageStatus & Opt = ImageStatus.NOT_EXIST;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  lastBuildDate?: Date;
}

export enum ImageStatus {
  NOT_EXIST = 'not_exist',
  BUILDING = 'building',
  BUILT = 'built',
}
