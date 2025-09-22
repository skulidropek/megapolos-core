import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { App } from './App.entity';
import { BaseEntity } from './Base.entity';
import { ObjectType, Field, ID } from 'type-graphql';
import { Hint } from '../../library/graphql_types_generator';

@Entity()
@ObjectType()
export class Repository extends BaseEntity {
  @Property({ length: -1 })
  @Field()
  url!: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  user?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  password?: string;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  @Field({ nullable: true })
  removeDate?: Date;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  name?: string;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  @Field({ nullable: true })
  lastFetchDate?: Date;

  @ManyToOne({ entity: () => App, nullable: true })
  @Field(() => App, { nullable: true })
  @Hint({ type: () => ID })
  app?: App;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  microserviceName?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  title?: string;
}

@ObjectType()
export class RepositoryFiles {
  @Field(() => [String])
  files: string[];

  @Field(() => [String])
  directories: string[];
}

@ObjectType()
export class LogCommit {
  @Field()
  hash: string;

  @Field()
  date: Date;

  @Field()
  message: string;

  @Field()
  refs: string;

  @Field()
  body: string;

  @Field()
  authorName: string;

  @Field()
  authorEmail: string;
}
