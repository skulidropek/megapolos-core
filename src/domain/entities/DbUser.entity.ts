import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { Dbms } from './Dbms.entity';
import { BaseEntity } from './Base.entity';
import { Db } from './Db.entity';
import { Hint } from '../../library/graphql_types_generator';

@Entity()
@ObjectType()
export class DbUser extends BaseEntity {
  @Property({ length: -1 })
  @Field()
  name!: string;

  @ManyToOne({ entity: () => Dbms })
  @Field(() => Dbms)
  @Hint({ skip: true })
  dbms!: Dbms;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  password?: string;

  @ManyToMany({ entity: () => Db, pivotTable: 'db_db_user' })
  dbs = new Collection<Db>(this);
}
