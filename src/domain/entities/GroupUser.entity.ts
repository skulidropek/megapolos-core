import {
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { Hint } from '../../library/graphql_types_generator';
import { User } from './User.entity';
import { BaseEntity } from './Base.entity';
import { GroupUserPrivilege } from './GroupUserPrivilege.entity';

@Entity()
@ObjectType()
export class GroupUser extends BaseEntity {
  @Property({ length: -1 })
  @Field()
  name!: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  restApi?: string;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  @Field({ nullable: true })
  disableDate?: Date;

  @ManyToMany({ entity: () => User, mappedBy: (o) => o.groups })
  @Field(() => [User])
  @Hint({ skip: true })
  users = new Collection<User>(this);

  @OneToMany(() => GroupUserPrivilege, (privilege) => privilege.groupUser)
  @Field(() => [GroupUserPrivilege])
  @Hint({ skip: true })
  privileges = new Collection<GroupUserPrivilege>(this);
}
