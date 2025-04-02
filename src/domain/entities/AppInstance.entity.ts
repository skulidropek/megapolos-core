import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity } from './Base.entity';
import { App } from './App.entity';
import { DeployStrategy } from './DeployStrategy.entity';
import { InstanceType } from './InstanceType.entity';
import { RemoveStrategy } from './RemoveStrategy.entity';
import { User } from './User.entity';

@Entity()
@ObjectType()
export class AppInstance extends BaseEntity {
  @Property({ length: -1, unique: 'app_instance_name_key' })
  @Field()
  name!: string;

  @ManyToOne({ entity: () => User })
  @Field(() => User)
  user!: User;

  @Property({ length: -1 })
  @Field()
  lifeStatus!: string;

  @Property({ length: -1 })
  @Field()
  appInstanceUrl!: string;

  @ManyToOne({ entity: () => App })
  @Field(() => App)
  app!: App;

  @ManyToOne({ entity: () => InstanceType, nullable: true })
  @Field(() => InstanceType, { nullable: true })
  instanceType?: InstanceType;

  @ManyToOne({ entity: () => DeployStrategy, nullable: true })
  @Field(() => DeployStrategy, { nullable: true })
  deployStrategy?: DeployStrategy;

  @ManyToOne({ entity: () => RemoveStrategy, nullable: true })
  @Field(() => RemoveStrategy, { nullable: true })
  removeStrategy?: RemoveStrategy;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  @Field({ nullable: true })
  removeDate?: Date;
}
