import { Entity, type Opt, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity } from './Base.entity';
import { Hint } from '../../library/graphql_types_generator';

@Entity()
@ObjectType()
export class Volume extends BaseEntity {
  @Property({ length: -1 })
  @Field()
  name!: string;

  @Property({ type: 'string', length: -1 })
  @Field(() => String)
  @Hint({ defaultValue: 'auto' })
  type: string & Opt = 'auto';

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  outerPath?: string;

  @Property({ type: 'uuid', nullable: true })
  @Field({ nullable: true })
  nodeId?: string;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  @Field({ nullable: true })
  removeDate?: Date;
}
