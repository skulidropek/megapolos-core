import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { Artifact } from './Artifact.entity';
import { BaseEntity } from './Base.entity';
import { Hint } from '../../library/graphql_types_generator';

@Entity()
@ObjectType()
export class DbBackup extends BaseEntity {
  @Property({ length: -1 })
  @Field()
  name!: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  type?: string;

  @Property({ type: 'text', nullable: true })
  @Field({ nullable: true })
  backup?: string;

  @ManyToOne({ entity: () => Artifact, nullable: true })
  @Field(() => Artifact, { nullable: true })
  @Hint({ skip: true })
  artifact?: Artifact;
}
