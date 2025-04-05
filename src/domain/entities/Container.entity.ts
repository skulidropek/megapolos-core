import { Entity, ManyToOne, type Opt, Property } from '@mikro-orm/core';
import { Field, ID, ObjectType } from 'type-graphql';
import { AppInstance } from './AppInstance.entity';
import { Domain } from './Domain.entity';
import { Image } from './Image.entity';
import { Node } from './Node.entity';
import { BaseEntity } from './Base.entity';
import { Hint } from '../../library/graphql_types_generator';

@ObjectType()
@Entity()
export class Container extends BaseEntity {
  @Field()
  @Property({ length: -1, unique: 'container_name_key' })
  name!: string;

  @Field(() => Image)
  @ManyToOne({ entity: () => Image })
  @Hint({ type: () => ID, skipOnUpdate: true, skipOnInput: true })
  image!: Image;

  @Field(() => Node)
  @ManyToOne({ entity: () => Node })
  @Hint({ type: () => ID, skipOnUpdate: true, skipOnInput: true })
  node!: Node;

  @Field({ nullable: true })
  @Property({ nullable: true })
  outerPort?: number;

  @Field(() => AppInstance)
  @ManyToOne({ entity: () => AppInstance })
  @Hint({ type: () => ID, skipOnUpdate: true, skipOnInput: true })
  appInstance!: AppInstance;

  @Field(() => String)
  @Property({ type: 'string', length: -1 })
  lifeStatus: string & Opt = 'stopped';

  @Field({ nullable: true })
  @Property({ columnType: 'timestamp(6)', nullable: true })
  removeDate?: Date;

  @Field({ nullable: true })
  @Property({ length: -1, nullable: true })
  dockerRuntimeId?: string;

  @Field(() => Domain, { nullable: true })
  @ManyToOne({ entity: () => Domain, nullable: true })
  @Hint({ type: () => ID, skipOnUpdate: true, skipOnInput: true })
  domain?: Domain;
}
