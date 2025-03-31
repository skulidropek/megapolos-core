import { Entity, type Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ID, ObjectType } from 'type-graphql';

@Entity()
@ObjectType()
export class GroupUser {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  @Field(() => ID)
  id!: string & Opt;

  @Property({ length: -1 })
  @Field()
  name!: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  restApi?: string;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  @Field({ nullable: true })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  @Field({ nullable: true })
  updateDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  @Field({ nullable: true })
  disableDate?: Date;
}
