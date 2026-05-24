import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Field, ID, ObjectType } from 'type-graphql';
import { Artifact } from './Artifact.entity';
import { BaseEntity } from './Base.entity';
import { AppInstance } from './AppInstance.entity';
import { Hint } from '../../library/graphql_types_generator';

@Entity()
@ObjectType()
export class AppInstanceBackup extends BaseEntity {
  @Property({ length: -1 })
  @Field()
  name!: string;

  @ManyToOne({ entity: () => AppInstance, nullable: true })
  @Field(() => AppInstance, { nullable: true })
  @Hint({ type: () => ID })
  appInstance?: AppInstance;

  @ManyToOne({ entity: () => Artifact, nullable: true })
  @Field(() => Artifact, { nullable: true })
  @Hint({ type: () => ID })
  artifact?: Artifact;
}
