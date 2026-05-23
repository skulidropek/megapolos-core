import {
  Entity,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { Field, ID, ObjectType } from 'type-graphql';
import { BaseEntity } from './Base.entity';
import { Artifact } from './Artifact.entity';
import { Volume } from './Volume.entity';
import { Hint } from '../../library/graphql_types_generator';

@Entity()
@ObjectType()
export class VolumeBackup extends BaseEntity {
  @Property({ length: -1 })
  @Field()
  name!: string;

  @ManyToOne({ entity: () => Artifact, nullable: true })
  @Field(() => Artifact, { nullable: true })
  @Hint({ type: () => Artifact })
  artifact?: Artifact;

  @ManyToOne({ entity: () => Volume, nullable: true })
  @Field(() => Volume, { nullable: true })
  @Hint({ type: () => Volume })
  volume?: Volume;
}
