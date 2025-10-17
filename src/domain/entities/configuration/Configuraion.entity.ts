import {
  Collection,
  Entity,
  OneToMany,
  ManyToOne,
  Property,
  Enum,
} from '@mikro-orm/core';
import { Field, ID, ObjectType, registerEnumType } from 'type-graphql';
import { BaseEntity } from './../Base.entity';
import { Hint } from '../../../library/graphql_types_generator';
import { App } from '../App.entity';

@ObjectType()
@Entity()
export class Configuraion extends BaseEntity {
  @Field(() => App)
  @ManyToOne({ entity: () => App })
  @Hint({ type: () => ID })
  app!: App;

  @Field()
  @Property({ length: -1 })
  name!: string;

  @Field(() => [ConfiguraionService])
  @OneToMany(() => ConfiguraionService, (service) => service.configuraion)
  @Hint({ skip: true })
  services = new Collection<ConfiguraionService>(this);
}

@ObjectType()
@Entity()
export class ConfiguraionService extends BaseEntity {
  @Field(() => Configuraion)
  @ManyToOne({ entity: () => Configuraion })
  @Hint({ type: () => ID })
  configuraion!: Configuraion;

  @Field()
  @Property({ length: -1 })
  role!: string;

  @Field(() => [ConfigurationVolume])
  @OneToMany(() => ConfigurationVolume, (volume) => volume.service)
  @Hint({ skip: true })
  volumes = new Collection<ConfigurationVolume>(this);

  @Field(() => [ConfigurationPort])
  @OneToMany(() => ConfigurationPort, (port) => port.service)
  @Hint({ skip: true })
  ports = new Collection<ConfigurationPort>(this);

  @Field(() => [ConfigurationDbWithUser])
  @OneToMany(() => ConfigurationDbWithUser, (db) => db.service)
  @Hint({ skip: true })
  dbs = new Collection<ConfigurationDbWithUser>(this);

  @Field(() => [ConfigurationEnvOption])
  @OneToMany(() => ConfigurationEnvOption, (env) => env.service)
  @Hint({ skip: true })
  envs = new Collection<ConfigurationEnvOption>(this);
}

@ObjectType()
@Entity()
export class ConfigurationVolume extends BaseEntity {
  @Field(() => ConfiguraionService)
  @ManyToOne({ entity: () => ConfiguraionService })
  @Hint({ type: () => ID })
  service!: ConfiguraionService;

  @Field()
  @Property({ length: -1 })
  role!: string;

  @Field()
  @Property({ length: -1 })
  innerPath!: string;
}

@ObjectType()
@Entity()
export class ConfigurationPort extends BaseEntity {
  @Field(() => ConfiguraionService)
  @ManyToOne({ entity: () => ConfiguraionService })
  @Hint({ type: () => ID })
  service!: ConfiguraionService;

  @Field()
  @Property({ length: -1 })
  role!: string;

  @Field()
  @Property()
  innerPort!: number;

  @Field({ nullable: true })
  @Property({ nullable: true })
  outerPort?: number;

  @Field()
  @Property({ default: false })
  isDomainRequired: boolean = false;

  @Field()
  @Property({ default: false })
  isLoginAndPasswordRequired: boolean = false;
}

@ObjectType()
@Entity()
export class ConfigurationDbWithUser extends BaseEntity {
  @Field(() => ConfiguraionService)
  @ManyToOne({ entity: () => ConfiguraionService })
  @Hint({ type: () => ID })
  service!: ConfiguraionService;

  @Field()
  @Property({ length: -1 })
  dbRole!: string;

  @Field()
  @Property({ length: -1 })
  dbUserRole!: string;
}

export enum ConfigurationEnvOptionType {
  Int = 'int',
  Boolean = 'boolean',
  String = 'string',
  List = 'list',
}

registerEnumType(ConfigurationEnvOptionType, {
  name: 'ConfigurationEnvOptionType',
  description: 'Types of enviroment varible',
});

@ObjectType()
@Entity()
export class ConfigurationEnvOption extends BaseEntity {
  @Field(() => ConfiguraionService)
  @ManyToOne({ entity: () => ConfiguraionService })
  @Hint({ type: () => ID })
  service!: ConfiguraionService;

  @Field()
  @Property({ length: -1 })
  name!: string;

  @Field(() => ConfigurationEnvOptionType)
  @Enum({ items: () => ConfigurationEnvOptionType })
  type!: ConfigurationEnvOptionType;

  @Field()
  @Property({ length: -1 })
  defaultValue!: string;

  @Field()
  @Property({ default: true })
  isRequired: boolean = true;

  @Field(() => [ConfigurationEnvOptionValue])
  @OneToMany(() => ConfigurationEnvOptionValue, (envOption) => envOption.env)
  @Hint({ skip: true })
  valueOptions = new Collection<ConfigurationEnvOptionValue>(this);
}

@ObjectType()
@Entity()
export class ConfigurationEnvOptionValue extends BaseEntity {
  @Field(() => ConfigurationEnvOption)
  @ManyToOne({ entity: () => ConfigurationEnvOption })
  @Hint({ type: () => ID })
  env!: ConfigurationEnvOption;

  @Field()
  @Property({ length: -1 })
  value!: string;

  @Field()
  @Property()
  order!: number;
}
