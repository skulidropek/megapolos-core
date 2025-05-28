import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Field, ID, ObjectType } from 'type-graphql';
import { Container } from './Container.entity';
import { Volume } from './Volume.entity';
import { Hint } from '../../library/graphql_types_generator';

@Entity()
@ObjectType()
export class ContainerVolume {
  @PrimaryKey({ type: 'uuid' })
  @Field(() => ID)
  id!: string & Opt;

  @Property({ length: -1 })
  @Field()
  name!: string;

  @ManyToOne({ entity: () => Container })
  @Field(() => Container)
  @Hint({ type: () => ID, skipOnUpdate: true })
  container!: Container & Opt;

  @ManyToOne({ entity: () => Volume })
  @Field(() => Volume, { nullable: true })
  @Hint({ type: () => ID, skipOnUpdate: true })
  volume!: Volume & Opt;

  @Property({ length: -1 })
  @Field({ nullable: true })
  innerPath!: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  isDynamic?: number;
}
