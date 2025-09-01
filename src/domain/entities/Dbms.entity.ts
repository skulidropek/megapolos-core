import { Entity, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity } from './Base.entity';

@Entity()
@ObjectType()
export class Dbms extends BaseEntity {
  @Property({ length: -1 })
  @Field()
  name!: string;

  @Property({ length: -1 })
  @Field()
  type!: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  host?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  user?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  password?: string;
}
