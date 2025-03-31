import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { GroupUser } from './GroupUser';

@Entity()
export class GroupUserPrivilege {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => GroupUser, defaultRaw: `gen_random_uuid()` })
  groupUser!: GroupUser & Opt;

  @Property({ length: -1 })
  objectName!: string;

  @Property({ length: -1 })
  objectId!: string;

  @Property({ length: -1 })
  action!: string;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  updateDate?: Date;
}
