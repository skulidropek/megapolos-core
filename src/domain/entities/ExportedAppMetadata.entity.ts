import { Entity, Property } from '@mikro-orm/core';

import { ObjectType, Field, ID } from 'type-graphql';
import { BaseEntity } from './Base.entity';

@Entity()
@ObjectType()
export class ExportedAppMetadata extends BaseEntity {
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
