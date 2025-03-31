import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { GroupUser } from './GroupUser';

@Entity()
export class User {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1 })
  name!: string;

  @ManyToOne({ entity: () => GroupUser, defaultRaw: `gen_random_uuid()` })
  groupUser!: GroupUser & Opt;

  @Property({ length: -1, nullable: true })
  restApi?: string;

  @Property({ type: 'string', length: -1 })
  userStatus: string & Opt = 'enable';

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  updateDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  disableDate?: Date;

  @Property({ length: -1, nullable: true })
  osUserId?: string;
}
