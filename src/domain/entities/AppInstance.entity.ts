import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { App } from './App.entity';
import { DeployStrategy } from './DeployStrategy.entity';
import { InstanceType } from './InstanceType.entity';
import { RemoveStrategy } from './RemoveStrategy.entity';
import { User } from './User.entity';

@Entity()
export class AppInstance {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1, unique: 'app_instance_name_key' })
  name!: string;

  @ManyToOne({ entity: () => User })
  user!: User;

  @Property({ length: -1 })
  lifeStatus!: string;

  @Property({ length: -1 })
  appInstanceUrl!: string;

  @ManyToOne({ entity: () => App })
  app!: App;

  @ManyToOne({ entity: () => InstanceType, nullable: true })
  instanceType?: InstanceType;

  @ManyToOne({ entity: () => DeployStrategy, nullable: true })
  deployStrategy?: DeployStrategy;

  @ManyToOne({ entity: () => RemoveStrategy, nullable: true })
  removeStrategy?: RemoveStrategy;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  updateDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  removeDate?: Date;
}
