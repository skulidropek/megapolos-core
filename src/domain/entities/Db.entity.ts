import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { DbUser } from './DbUser.entity';
import { Dbms } from './Dbms.entity';

@Entity()
export class Db {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1 })
  name!: string;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  updateDate?: Date;

  @ManyToOne({ entity: () => Dbms })
  dbms!: Dbms;

  @Property({ type: 'boolean', nullable: true })
  isCore?: boolean = false;

  @ManyToMany({
    entity: () => DbUser,
    joinColumn: 'db_id',
    inverseJoinColumn: 'db_user_id',
  })
  dbUser = new Collection<DbUser>(this);
}
