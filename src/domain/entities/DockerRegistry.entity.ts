import { Entity, ManyToOne, Opt, Property } from '@mikro-orm/core';
import { Container } from './Container.entity';
import { Field, ID, ObjectType } from 'type-graphql';
import { Hint } from '../../library/graphql_types_generator';
import { BaseEntity } from './Base.entity';

@Entity()
@ObjectType()
export class DockerRegistry extends BaseEntity {
  @Property({ length: -1 })
  @Field()
  name!: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  host?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  user?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  password?: string;

  @Field(() => Container, { nullable: true })
  @ManyToOne({ entity: () => Container, nullable: true })
  @Hint({ type: () => ID })
  container?: Container;

  @Property({ type: 'boolean', nullable: true })
  @Field({ nullable: true })
  isDefault?: boolean = false;
}
