import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Field, ID, ObjectType } from 'type-graphql';
import { Container } from './Container.entity';
import { Hint } from '../../library/graphql_types_generator';

@Entity()
@ObjectType()
export class ContainerVariable {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  @Field(() => ID)
  id!: string & Opt;

  @ManyToOne({ entity: () => Container })
  @Field(() => Container)
  @Hint({ type: () => ID, skipOnUpdate: true })
  container!: Container;

  @Property({ length: -1 })
  @Field()
  name!: string;

  @Property({ length: -1 })
  @Field()
  value!: string;

  @Property({ length: -1 })
  @Field()
  type!: string;
}
