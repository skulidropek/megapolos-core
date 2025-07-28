import { Entity, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity } from './Base.entity';

@Entity()
@ObjectType()
export class AppVersion extends BaseEntity {
  @Property({ length: -1 })
  @Field()
  app_id!: string;

  @Property()
  @Field()
  build_number!: number;

  @Property({ length: -1 })
  @Field()
  version!: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  version_comment?: string;
}
