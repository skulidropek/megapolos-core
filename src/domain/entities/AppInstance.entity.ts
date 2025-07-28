import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Field, ID, ObjectType } from 'type-graphql';
import { BaseEntity } from './Base.entity';
import { App } from './App.entity';
import { DeployStrategy } from './DeployStrategy.entity';
import { InstanceType } from './InstanceType.entity';
import { RemoveStrategy } from './RemoveStrategy.entity';
import { User } from './User.entity';
import { Hint } from '../../library/graphql_types_generator';

@Entity()
@ObjectType()
export class AppInstance extends BaseEntity {
  @Property({ length: -1, unique: 'app_instance_name_key' })
  @Field()
  name!: string;

  @ManyToOne({ entity: () => User })
  @Field(() => User)
  @Hint({ type: () => ID, skipOnUpdate: true, skipOnInput: true })
  user!: User;

  @Property({ length: -1 })
  @Field()
  lifeStatus!: string;

  @Property({ length: -1 })
  @Field()
  appInstanceUrl!: string;

  @ManyToOne({ entity: () => App })
  @Field(() => App)
  @Hint({ type: () => ID })
  app!: App;

  @Property({ length: -1, nullable: true })
  @Field({ nullable: true })
  appVersionId!: string;

  @ManyToOne({ entity: () => InstanceType, nullable: true })
  @Field(() => InstanceType, { nullable: true })
  @Hint({ type: () => ID })
  instanceType?: InstanceType;

  @ManyToOne({ entity: () => DeployStrategy, nullable: true })
  @Field(() => DeployStrategy, { nullable: true })
  @Hint({ type: () => ID })
  deployStrategy?: DeployStrategy;

  @ManyToOne({ entity: () => RemoveStrategy, nullable: true })
  @Field(() => RemoveStrategy, { nullable: true })
  @Hint({ type: () => ID })
  removeStrategy?: RemoveStrategy;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  @Field({ nullable: true })
  @Hint({ skipOnInput: true, skipOnUpdate: true })
  removeDate?: Date;
}
