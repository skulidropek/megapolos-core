import {
  Collection,
  Entity,
  OneToMany,
  ManyToOne,
  Property,
  Enum,
  Cascade,
} from '@mikro-orm/core';
import { Field, ID, ObjectType, registerEnumType } from 'type-graphql';
import { BaseEntity } from '../Base.entity';
import { Hint } from '../../../library/graphql_types_generator';
import { App } from '../App.entity';

@ObjectType()
@Entity()
export class Configuration extends BaseEntity {
  @Field(() => App)
  @ManyToOne({ entity: () => App })
  @Hint({ type: () => ID })
  app!: App;

  @Field()
  @Property({ length: -1 })
  name!: string;

  @Field(() => [ConfigurationService])
  @OneToMany(() => ConfigurationService, (service) => service.configuration, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
    orphanRemoval: true,
  })
  @Hint({ skip: true })
  services = new Collection<ConfigurationService>(this);
}

@ObjectType()
@Entity()
export class ConfigurationService extends BaseEntity {
  @ManyToOne({ entity: () => Configuration })
  configuration!: Configuration;

  @Field()
  @Property({ length: -1 })
  role!: string;

  @Field(() => [ConfigurationVolume])
  @OneToMany(() => ConfigurationVolume, (volume) => volume.service, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
    orphanRemoval: true,
  })
  @Hint({ skip: true })
  volumes = new Collection<ConfigurationVolume>(this);

  @Field(() => [ConfigurationPort])
  @OneToMany(() => ConfigurationPort, (port) => port.service, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
    orphanRemoval: true,
  })
  @Hint({ skip: true })
  ports = new Collection<ConfigurationPort>(this);

  @Field(() => [ConfigurationDbWithUser])
  @OneToMany(() => ConfigurationDbWithUser, (db) => db.service, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
    orphanRemoval: true,
  })
  @Hint({ skip: true })
  dbs = new Collection<ConfigurationDbWithUser>(this);

  @Field(() => [ConfigurationEnvOption])
  @OneToMany(() => ConfigurationEnvOption, (env) => env.service, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
    orphanRemoval: true,
  })
  @Hint({ skip: true })
  envs = new Collection<ConfigurationEnvOption>(this);
}

@ObjectType()
@Entity()
export class ConfigurationVolume extends BaseEntity {
  @ManyToOne({ entity: () => ConfigurationService })
  service!: ConfigurationService;

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
  @ManyToOne({ entity: () => ConfigurationService })
  service!: ConfigurationService;

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
  @ManyToOne({ entity: () => ConfigurationService })
  service!: ConfigurationService;

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
  @ManyToOne({ entity: () => ConfigurationService })
  service!: ConfigurationService;

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

  @OneToMany(() => ConfigurationEnvOptionValue, (envOption) => envOption.env, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
    orphanRemoval: true,
  })
  @Hint({ skip: true })
  valueOptions = new Collection<ConfigurationEnvOptionValue>(this);
}

@Entity()
export class ConfigurationEnvOptionValue extends BaseEntity {
  @ManyToOne({ entity: () => ConfigurationEnvOption })
  env!: ConfigurationEnvOption;

  @Property({ length: -1 })
  value!: string;

  @Property()
  order!: number;
}
