import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Field, ID, ObjectType } from 'type-graphql';
import { GroupUser } from './GroupUser.entity';

@Entity()
@ObjectType()
export class User {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  @Field(() => ID)
  id!: string & Opt;

  @Property({ length: -1 })
  @Field()
  name!: string;

  @ManyToOne({ entity: () => GroupUser, defaultRaw: `gen_random_uuid()` })
  @Field(() => GroupUser)
  groupUser!: GroupUser & Opt;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  restApi?: string;

  @Property({ type: 'string', length: -1 })
  @Field(() => String, { nullable: true })
  userStatus: string & Opt = 'enable';

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  @Field({ nullable: true })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  @Field({ nullable: true })
  updateDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  @Field({ nullable: true })
  disableDate?: Date;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  osUserId?: string;
}
