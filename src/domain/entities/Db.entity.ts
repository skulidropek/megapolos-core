import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { Field, ID, ObjectType } from 'type-graphql';
import { DbUser } from './DbUser.entity';
import { Dbms } from './Dbms.entity';
import { BaseEntity } from './Base.entity';
import { Hint } from '../../library/graphql_types_generator';
import { DbDbUser } from './DbDbUser.entity';

@Entity()
@ObjectType()
export class Db extends BaseEntity {
  @Property({ length: -1 })
  @Field()
  name!: string;

  @ManyToOne({ entity: () => Dbms })
  @Field(() => Dbms)
  @Hint({ type: () => ID })
  dbms!: Dbms;

  @Property({ type: 'boolean', nullable: true })
  @Field({ nullable: true })
  @Hint({ skip: true })
  isCore?: boolean = false;

  @ManyToMany({ entity: () => DbUser, pivotEntity: () => DbDbUser })
  @Field(() => [DbUser])
  @Hint({ skip: true })
  users = new Collection<DbUser>(this);
}
