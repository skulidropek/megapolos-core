import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Field, ID, ObjectType } from 'type-graphql';
import { Container } from './Container.entity';

@ObjectType()
@Entity()
export class ContainerEnvOption {
  @Field(() => ID)
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Field(() => Container)
  @ManyToOne({ entity: () => Container, defaultRaw: `gen_random_uuid()` })
  container!: Container & Opt;

  @Field()
  @Property({ length: -1 })
  containerEnvName!: string;

  @Field()
  @Property({ length: -1 })
  containerEnvValue!: string;
}
