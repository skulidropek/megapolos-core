import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { Dbms } from './Dbms.entity';
import { BaseEntity } from './Base.entity';
import { Db } from './Db.entity';

@Entity()
export class DbUser extends BaseEntity {
  @Property({ length: -1 })
  name!: string;

  @ManyToOne({ entity: () => Dbms })
  dbms!: Dbms;

  @Property({ length: -1, nullable: true })
  password?: string;

  @ManyToMany({ entity: () => Db, pivotTable: 'db_db_user' })
  dbs = new Collection<Db>(this);
}
