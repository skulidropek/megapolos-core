import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  ManyToMany,
  type Opt,
  Property,
} from '@mikro-orm/core';
import { Field, ID, ObjectType, registerEnumType } from 'type-graphql';
import { BaseEntity } from './Base.entity';
import { App } from './App.entity';
import { Repository } from './Repository.entity';
import { Hint } from '../../library/graphql_types_generator';
import { ImageEnvRequirement } from './ImageEnvRequirement.entity';
import { AppVersion } from './AppVersion.entity';

export enum ImageStatus {
  NotExist = 'not_exist',
  Building = 'building',
  Built = 'built',
}

registerEnumType(ImageStatus, {
  name: 'ImageStatus',
  description: 'The status of the image',
});

@Entity()
@ObjectType()
export class Image extends BaseEntity {
  @Property({ length: -1, unique: 'image_name_key' })
  @Field()
  name!: string;

  @ManyToOne({ entity: () => App, defaultRaw: `gen_random_uuid()` })
  @Field(() => App)
  @Hint({ type: () => ID })
  app!: App & Opt;

  @Property({ length: -1 })
  @Field()
  image!: string;

  @Property()
  @Field()
  innerPort!: number;

  @Property({ type: 'integer' })
  @Field(() => Number)
  @Hint({ defaultValue: 1, skip: true })
  hasState: number & Opt = 1;

  @Property({ type: 'string', length: -1 })
  @Field(() => String)
  @Hint({ defaultValue: '', skip: true })
  tags: string & Opt = '';

  @Property()
  @Field()
  buildNumber!: number;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  version?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  versionComment?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  commitId!: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  branch!: string;

  @ManyToOne({ entity: () => Repository, nullable: true })
  @Field(() => Repository, { nullable: true })
  @Hint({ type: () => ID })
  repository?: Repository;

  @Enum({ items: () => ImageStatus })
  @Field(() => ImageStatus)
  @Hint({ defaultValue: ImageStatus.NotExist, skip: true })
  status: ImageStatus & Opt = ImageStatus.NotExist;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  @Field({ nullable: true })
  lastBuildDate?: Date;

  @OneToMany(() => ImageEnvRequirement, (env) => env.image)
  @Field(() => [ImageEnvRequirement])
  @Hint({ skip: true })
  envs = new Collection<ImageEnvRequirement>(this);

  // @ManyToMany(() => AppVersion, (appVersion) => appVersion.images)
  // appVersions = new Collection<AppVersion>(this);
}
