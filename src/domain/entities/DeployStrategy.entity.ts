import { Entity, type Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity } from './Base.entity';

@Entity()
@ObjectType()
export class DeployStrategy extends BaseEntity {
  @PrimaryKey({ type: 'uuid' })
  @Field(() => String)
  id!: string & Opt;

  @Property({ length: -1, unique: 'deploy_strategy_name_key' })
  @Field()
  name!: string;
}
