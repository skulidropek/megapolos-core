import { Entity, Enum, ManyToOne, type Opt, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity } from './Base.entity';
import { App } from './App.entity';
import { Repository } from './Repository.entity';
import { Hint } from '../../library/graphql_types_generator';

export enum ImageStatus {
  NotExist = 'not_exist',
  Building = 'building',
  Built = 'built',
}

@Entity()
@ObjectType()
export class Image extends BaseEntity {
  @Property({ length: -1, unique: 'image_name_key' })
  @Field()
  name!: string;

  @ManyToOne({ entity: () => App, defaultRaw: `gen_random_uuid()` })
  @Field(() => App)
  app!: App & Opt;

  @Property({ length: -1 })
  @Field()
  image!: string;

  @Property()
  @Field()
  innerPort!: number;

  @Property({ type: 'integer' })
  @Field(() => Number)
  @Hint({ defaultValue: 1 })
  hasState: number & Opt = 1;

  @Property({ type: 'string', length: -1 })
  @Field(() => String)
  @Hint({ defaultValue: '' })
  tags: string & Opt = '';

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  commitId?: string;

  @ManyToOne({ entity: () => Repository, nullable: true })
  @Field(() => Repository, { nullable: true })
  repository?: Repository;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  branch?: string;

  @Enum({ items: () => ImageStatus })
  @Field(() => ImageStatus)
  @Hint({ defaultValue: ImageStatus.NotExist })
  status: ImageStatus & Opt = ImageStatus.NotExist;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  @Field({ nullable: true })
  lastBuildDate?: Date;
}
