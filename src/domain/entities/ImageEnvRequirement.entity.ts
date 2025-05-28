import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Field, ID, ObjectType } from 'type-graphql';
import { Image } from './Image.entity';
import { Hint } from '../../library/graphql_types_generator';

@Entity()
@ObjectType()
export class ImageEnvRequirement {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  @Field(() => ID)
  @Hint({ type: () => ID, skip: true })
  id!: string & Opt;

  @ManyToOne({ entity: () => Image, defaultRaw: `gen_random_uuid()` })
  @Field(() => Image)
  @Hint({ type: () => ID, skip: true })
  image!: Image & Opt;

  @Property({ length: -1 })
  @Field()
  name!: string;

  @Property({ length: -1 })
  @Field()
  envName!: string;

  @Property({ length: -1 })
  @Field()
  envDefaultValue!: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  type?: string;
}
