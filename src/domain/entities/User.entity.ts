import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  type Opt,
  Property,
} from '@mikro-orm/core';
import { Field, ID, ObjectType } from 'type-graphql';
import { GroupUser } from './GroupUser.entity';
import { Hint } from '../../library/graphql_types_generator';
import { BaseEntity } from './Base.entity';
import { UserGroupLink } from './UserGroupLink.entity';

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @Property({ length: -1 })
  @Field()
  name!: string;

  @ManyToOne({ entity: () => GroupUser })
  @Field(() => GroupUser)
  @Hint({ type: () => ID, skipOnUpdate: true })
  groupUser!: GroupUser;

  @ManyToMany(() => GroupUser, undefined, { pivotTable: 'user_group_link' })
  @Field(() => [GroupUser])
  @Hint({ skip: true })
  groups = new Collection<GroupUser>(this);

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  restApi?: string;

  @Property({ type: 'string', length: -1 })
  @Field(() => String, { nullable: true })
  @Hint({ defaultValue: 'enable' })
  userStatus: string & Opt = 'enable';

  @Property({ columnType: 'timestamp(6)', nullable: true })
  @Field({ nullable: true })
  disableDate?: Date;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  osUserId?: string;
}
