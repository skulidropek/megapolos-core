import { Entity, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity } from './Base.entity';

@Entity()
@ObjectType()
export class DbSchemaEntity extends BaseEntity {
  @Property({ length: -1 })
  @Field()
  name!: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  type?: string;

  @Property({ type: 'json', columnType: 'json', nullable: true })
  @Field(() => String, { nullable: true })
  schema?: string;
}

@ObjectType()
export class DbSchemaField {
  @Field()
  name!: string;

  @Field()
  type!: string;

  @Field()
  notNull!: boolean;

  @Field()
  unique!: boolean;

  @Field()
  primaryKey!: boolean;
}

@ObjectType()
export class DbSchemaForeignKey {
  @Field()
  name!: string;

  @Field()
  field!: string;

  @Field()
  foreignTable!: string;

  @Field()
  foreignField!: string;
}

@ObjectType()
export class DbSchemaTable {
  @Field()
  name!: string;

  @Field(() => [DbSchemaField])
  fields!: DbSchemaField[];

  @Field(() => [DbSchemaForeignKey])
  foreignKeys!: DbSchemaForeignKey[];
}

@ObjectType()
export class DbSchema {
  @Field(() => [DbSchemaTable])
  tables!: DbSchemaTable[];
}
