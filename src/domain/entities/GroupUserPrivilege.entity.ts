import { Entity, ManyToOne, type Opt, Property } from '@mikro-orm/core';
import { GroupUser } from './GroupUser.entity';
import { BaseEntity } from './Base.entity';
import { ObjectType } from 'type-graphql';
import { Field } from 'type-graphql';
import { Hint } from '../../library/graphql_types_generator';

@Entity()
@ObjectType()
export class GroupUserPrivilege extends BaseEntity {
  @ManyToOne({ entity: () => GroupUser })
  @Field(() => GroupUser)
  @Hint({ skip: true })
  groupUser!: GroupUser & Opt;

  @Property({ length: -1 })
  @Field()
  objectName!: string;

  @Property({ length: -1 })
  @Field()
  objectId!: string;

  @Property({ length: -1 })
  @Field()
  action!: string;
}
