import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { AppInstance } from './AppInstance.entity';
import { Domain } from './Domain.entity';
import { Image } from './Image.entity';
import { Node } from './Node.entity';

@Entity()
export class Container {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1, unique: 'container_name_key' })
  name!: string;

  @ManyToOne({ entity: () => Image })
  image!: Image;

  @ManyToOne({ entity: () => Node })
  node!: Node;

  @Property({ nullable: true })
  outerPort?: number;

  @ManyToOne({ entity: () => AppInstance })
  appInstance!: AppInstance;

  @Property({ type: 'string', length: -1 })
  lifeStatus: string & Opt = 'stopped';

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  updateDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  removeDate?: Date;

  @Property({ length: -1, nullable: true })
  dockerRuntimeId?: string;

  @ManyToOne({ entity: () => Domain, nullable: true })
  domain?: Domain;
}
