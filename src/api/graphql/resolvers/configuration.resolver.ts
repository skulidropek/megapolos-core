import {
  Ctx,
  FieldResolver,
  Root,
  Resolver,
  Mutation,
  Arg,
  Query,
  InputType,
  Field,
  Int,
} from 'type-graphql';
import { Context } from '../server';
import {
  Configuration,
  ConfigurationService,
  ConfigurationDbWithUser,
  ConfigurationEnvOption,
  ConfigurationPort,
  ConfigurationVolume,
  ConfigurationEnvOptionType,
} from '../../../domain/entities/configuration/Configuration.entity';
import {
  ConfigurationRepo,
  ConfigurationServiceRepo,
  ConfigurationEnvOptionRepo,
} from '../../../features/repository/configuration.repository';
import { App } from '../../../domain/entities/App.entity';
import AppRepo from '../../../features/repository/app.repository';
import { Repository } from '../../../domain/entities/Repository.entity';

@InputType()
class ConfigurationVolumeInput {
  @Field()
  role!: string;
  @Field()
  innerPath!: string;
}

@InputType()
class ConfigurationPortInput {
  @Field()
  role!: string;
  @Field(() => Int)
  innerPort!: number;
  @Field(() => Int)
  outerPort!: number;
  @Field()
  isDomainRequired!: boolean;
  @Field()
  isLoginAndPasswordRequired!: boolean;
}

@InputType()
class ConfigurationDbInput {
  @Field()
  dbRole!: string;
  @Field()
  dbUserRole!: string;
}

@InputType()
class ConfigurationEnvInput {
  @Field()
  name!: string;
  @Field()
  defaultValue!: string;
  @Field(() => ConfigurationEnvOptionType)
  type!: ConfigurationEnvOptionType;
  @Field()
  isRequired!: boolean;
  @Field(() => [String])
  valueOptions!: string[];
}

@InputType()
class ConfigurationServiceInput {
  @Field()
  role!: string;
  @Field({ nullable: true })
  repository: string;
  @Field(() => Int, { nullable: true })
  cpuCount: number;
  @Field(() => Int, { nullable: true })
  ramSize: number;
  @Field(() => Int, { nullable: true })
  diskSize: number;
  @Field(() => [ConfigurationVolumeInput])
  volumes!: ConfigurationVolumeInput[];
  @Field(() => [ConfigurationPortInput])
  ports!: ConfigurationPortInput[];
  @Field(() => [ConfigurationDbInput])
  dbs!: ConfigurationDbInput[];
  @Field(() => [ConfigurationEnvInput])
  envs!: ConfigurationEnvInput[];
}

@InputType()
export class ConfigurationDataInput {
  @Field()
  name!: string;
  @Field(() => [ConfigurationServiceInput])
  services!: ConfigurationServiceInput[];
}

@Resolver()
export class ConfigurationResolver {
  @Query(() => Configuration)
  async getConfiguration(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<Configuration> {
    return new ConfigurationRepo(ctx, id).getEntity();
  }

  @Query(() => [Configuration])
  async getAllConfiguration(@Ctx() ctx: Context): Promise<Configuration[]> {
    return new ConfigurationRepo(ctx).getAll();
  }

  //createConfiguration(appId, configurationData)
  //editConfiguration
  @Mutation(() => Configuration)
  async createConfiguration(
    @Arg('appId') appId: string,
    @Arg('configurationData') configurationData: ConfigurationDataInput,
    @Ctx() ctx: Context
  ): Promise<Configuration> {
    return new ConfigurationRepo(ctx).createOrEditFromData({
      appId,
      configurationData,
    });
  }

  @Mutation(() => Configuration)
  async editConfiguration(
    @Arg('id') id: string,
    @Arg('configurationData') configurationData: ConfigurationDataInput,
    @Ctx() ctx: Context
  ): Promise<Configuration> {
    return new ConfigurationRepo(ctx, id).createOrEditFromData({
      configurationData,
    });
  }

  @Mutation(() => Boolean)
  async deleteConfiguration(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<Boolean> {
    return new ConfigurationRepo(ctx, id).deleteCascade();
  }
}

@Resolver(() => Configuration)
export class ConfigurationFieldsResolver {
  @FieldResolver(() => App)
  async app(
    @Root() configuration: Configuration,
    @Ctx() ctx: Context
  ): Promise<App> {
    return new AppRepo(ctx, configuration.app.id).getEntity();
  }

  @FieldResolver(() => [ConfigurationService])
  async services(
    @Root() configuration: Configuration,
    @Ctx() ctx: Context
  ): Promise<ConfigurationService[]> {
    return await new ConfigurationRepo(ctx, configuration.id).getServices();
  }
}

@Resolver(() => ConfigurationService)
export class ConfigurationServiceFieldsResolver {
  @FieldResolver(() => Repository, { nullable: true })
  async repository(
    @Root() service: ConfigurationService,
    @Ctx() ctx: Context
  ): Promise<Repository | null> {
    return await new ConfigurationServiceRepo(ctx, service.id).getRepository();
  }

  @FieldResolver(() => [ConfigurationVolume])
  async volumes(
    @Root() service: ConfigurationService,
    @Ctx() ctx: Context
  ): Promise<ConfigurationVolume[]> {
    return await new ConfigurationServiceRepo(ctx, service.id).getVolumes();
  }

  @FieldResolver(() => [ConfigurationPort])
  async ports(
    @Root() service: ConfigurationService,
    @Ctx() ctx: Context
  ): Promise<ConfigurationPort[]> {
    return await new ConfigurationServiceRepo(ctx, service.id).getPorts();
  }

  @FieldResolver(() => [ConfigurationDbWithUser])
  async dbs(
    @Root() service: ConfigurationService,
    @Ctx() ctx: Context
  ): Promise<ConfigurationDbWithUser[]> {
    return await new ConfigurationServiceRepo(ctx, service.id).getDbs();
  }

  @FieldResolver(() => [ConfigurationEnvOption])
  async envs(
    @Root() service: ConfigurationService,
    @Ctx() ctx: Context
  ): Promise<ConfigurationEnvOption[]> {
    return await new ConfigurationServiceRepo(ctx, service.id).getEnvs();
  }
}

@Resolver(() => ConfigurationVolume)
export class ConfigurationVolumeFieldsResolver {}

@Resolver(() => ConfigurationPort)
export class ConfigurationPortResolver {}

@Resolver(() => ConfigurationDbWithUser)
export class ConfigurationDbWithUserResolver {}

@Resolver(() => ConfigurationEnvOption)
export class ConfigurationEnvOptionResolver {
  @FieldResolver(() => [String])
  async valueOptions(
    @Root() env: ConfigurationEnvOption,
    @Ctx() ctx: Context
  ): Promise<string[]> {
    return await new ConfigurationEnvOptionRepo(ctx, env.id).getValueOptions();
  }
}
