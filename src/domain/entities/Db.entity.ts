import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { DbUser } from './DbUser.entity';
import { Dbms } from './Dbms.entity';
import { BaseEntity } from './Base.entity';

@Entity()
export class Db extends BaseEntity {
  @Property({ length: -1 })
  name!: string;

  @ManyToOne({ entity: () => Dbms })
  dbms!: Dbms;

  @Property({ type: 'boolean', nullable: true })
  isCore?: boolean = false;

  @ManyToMany({ entity: () => DbUser, pivotTable: 'db_db_user' })
  users = new Collection<DbUser>(this);
}
