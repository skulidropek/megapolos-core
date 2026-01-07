import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  type Opt,
  Property,
} from '@mikro-orm/core';
import { User } from './User.entity';
import { ObjectType, Field, ID } from 'type-graphql';
import { BaseEntity } from './Base.entity';
import { Hint } from '../../library/graphql_types_generator';
import { AppVersion } from './AppVersion.entity';
import { Configuration } from './configuration/Configuration.entity';

@Entity()
@ObjectType()
export class UploadedFiles extends BaseEntity {
  @Property({
    type: 'text',
    unique: true,
  })
  @Field()
  filename!: string;

  @Property({
    fieldName: 'original_name',
    type: 'text',
    unique: true,
  })
  @Field()
  originalName!: string;
}
