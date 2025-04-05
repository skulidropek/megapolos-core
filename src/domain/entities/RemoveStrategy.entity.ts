import { Entity, type Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class RemoveStrategy {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  @Field(() => String)
  id!: string & Opt;

  @Property({ length: -1, unique: 'remove_strategy_name_key' })
  @Field()
  name!: string;
}
