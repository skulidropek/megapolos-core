import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './Base.entity';
import { Field, ObjectType } from 'type-graphql';

@Entity()
@ObjectType()
export class Artifact extends BaseEntity {
  @Property({ length: -1 })
  @Field()
  name!: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  type?: string;
}
