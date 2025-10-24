import {
  Entity,
  Property,
  ManyToMany,
  Collection,
  ManyToOne,
} from '@mikro-orm/core';
import { Field, ID, ObjectType } from 'type-graphql';
import { BaseEntity } from './Base.entity';
import { Image } from './Image.entity';
import { App } from './App.entity';
import { Hint } from '../../library/graphql_types_generator';
import { Configuration } from './configuration/Configuration.entity';

@Entity()
@ObjectType()
export class AppVersion extends BaseEntity {
  @ManyToOne({ entity: () => App })
  @Field(() => App)
  @Hint({ type: () => ID, skipOnUpdate: true })
  app!: App;

  @ManyToOne({ entity: () => Configuration })
  @Field(() => Configuration)
  @Hint({ type: () => ID })
  configuration!: Configuration;

  @Property()
  @Field()
  buildNumber!: number;

  @Property({ length: -1 })
  @Field({ nullable: true })
  version?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  versionComment?: string;

  @ManyToMany({
    entity: () => Image,
    pivotTable: 'app_version_images',
    owner: true,
    mappedBy: (image) => image.appVersions,
  })
  images = new Collection<Image>(this);
}
