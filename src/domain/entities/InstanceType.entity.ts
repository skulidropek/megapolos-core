import { Entity, type Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';

@Entity()
@ObjectType()
export class InstanceType {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  @Field(() => String)
  id!: string & Opt;

  @Property({ length: -1, unique: 'instance_type_name_key' })
  @Field()
  name!: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  appVersionId!: string;
}
