import { Entity, Property } from '@mikro-orm/core';

import { ObjectType, Field, ID } from 'type-graphql';
import { BaseEntity } from './Base.entity';

@Entity({ tableName: 'app_export' })
@ObjectType()
export class AppExport extends BaseEntity {
  @Property({ type: 'text', unique: true })
  @Field()
  name!: string;

  @Property({ type: 'jsonb' })
  @Field(() => String, {
    description: 'Полный конфиг приложения в формате JSON',
  })
  manifest: Record<string, any> = {};
}
