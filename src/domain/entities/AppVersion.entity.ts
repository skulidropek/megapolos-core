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

@Entity()
@ObjectType()
export class AppVersion extends BaseEntity {
  @ManyToOne({ entity: () => App })
  @Field(() => App)
  @Hint({ type: () => ID, skipOnUpdate: true })
  app!: App;

  @Property()
  @Field()
  build_number!: number;

  // TODO - suspicious inconsistence of 'version?' vs '@Field()' -
  // the field is obligatory in graphQL ('nullable: true' is not set)
  // but not in typescript ('?' symbol)
  // (such inconsistence is present in many places)
  @Property({ length: -1 })
  @Field()
  version?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  version_comment?: string;

  @ManyToMany(() => Image, (image) => image.appVersions, { owner: true })
  @Field(() => [Image])
  @Hint({ skip: true })
  images = new Collection<Image>(this);
}
