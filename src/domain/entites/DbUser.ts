import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Dbms } from './Dbms';

@Entity()
export class DbUser {
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

  @Property({ length: -1, nullable: true })
  password?: string;
}
