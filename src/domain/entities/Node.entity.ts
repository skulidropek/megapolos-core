import { Entity, type Opt, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity } from './Base.entity';
import { Hint } from '../../library/graphql_types_generator';

@Entity()
@ObjectType()
export class Node extends BaseEntity {
  @Property({ length: -1, unique: 'node_name_key' })
  @Field()
  name!: string;

  @Property({ length: -1 })
  @Field()
  host!: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  cpu?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  memory?: string;

  @Property({ type: 'string', length: -1 })
  @Field(() => String)
  @Hint({ defaultValue: 'running' })
  lifeStatus: string & Opt = 'running';

  @Property({ columnType: 'timestamp(6)', nullable: true })
  @Field({ nullable: true })
  removeDate?: Date;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  user?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  password?: string;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  @Field({ nullable: true })
  lastUpdateDate?: Date;

  @Property({ columnType: 'varchar[]', nullable: true })
  @Field(() => [String], { nullable: true })
  dockerMirrors?: string[];
}
