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
import { Configuraion } from './configuration/Configuraion.entity';

@Entity()
@ObjectType()
export class AppVersion extends BaseEntity {
  @ManyToOne({ entity: () => App })
  @Field(() => App)
  @Hint({ type: () => ID, skipOnUpdate: true })
  app!: App;

  @ManyToOne({ entity: () => Configuraion })
  @Field(() => Configuraion)
  @Hint({ type: () => ID })
  configuraion!: Configuraion;

  @Property()
  @Field()
  buildNumber!: number;

  @Property({ length: -1 })
  @Field({ nullable: true })
  version?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  versionComment?: string;

  @ManyToMany({ entity: () => Image, owner: true })
  images = new Collection<Image>(this);
}
