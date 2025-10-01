import { Entity, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity } from './Base.entity';

@Entity()
@ObjectType()
export class Log extends BaseEntity {
  @Property({ length: -1 })
  @Field()
  name!: string;

  @Property({ type: 'boolean', nullable: true })
  @Field({ nullable: true })
  isClosed?: boolean = false;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  @Field({ nullable: true })
  closeDate?: Date;

  @Property({ type: 'uuid', nullable: true })
  @Field({ nullable: true })
  containerId?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  containerName?: string;

  @Property({ type: 'uuid', nullable: true })
  @Field({ nullable: true })
  nodeId?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  nodeName?: string;

  @Property({ type: 'uuid', nullable: true })
  @Field({ nullable: true })
  objectId?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  objectName?: string;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  objectType?: string;

  @Property({ type: 'jsonb', nullable: true })
  @Field(() => String, { nullable: true })
  objectMeta?: Record<string, any>;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  type?: string;
}
