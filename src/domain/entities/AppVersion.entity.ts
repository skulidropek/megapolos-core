import { Entity, Property, ManyToMany, Collection } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity } from './Base.entity';
import { Image } from './Image.entity';

@Entity()
@ObjectType()
export class AppVersion extends BaseEntity {
  @Property({ length: -1 })
  @Field()
  app_id!: string;

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
  images = new Collection<Image>(this);
}
