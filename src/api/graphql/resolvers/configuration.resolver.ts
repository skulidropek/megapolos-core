import {
  Ctx,
  FieldResolver,
  Root,
  Resolver,
  Mutation,
  Arg,
} from 'type-graphql';
import { Context } from '../server';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import {
  Configuration,
  ConfigurationService,
  ConfigurationDbWithUser,
  ConfigurationEnvOption,
  ConfigurationPort,
  ConfigurationVolume,
} from '../../../domain/entities/configuration/Configuration.entity';
import {
  ConfigurationRepo,
  ConfigurationServiceRepo,
  ConfigurationEnvOptionRepo,
} from '../../../features/repository/configuration.repository';
import { App } from '../../../domain/entities/App.entity';
import AppRepo from '../../../features/repository/app.repository';

@Resolver()
export class ConfigurationResolver {
  //createConfiguration(appId, configurationData)
  //deleteConfiguration(configurationId)
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
  @FieldResolver(() => [ConfigurationEnvOption])
  async valueOptions(
    @Root() env: ConfigurationEnvOption,
    @Ctx() ctx: Context
  ): Promise<string[]> {
    return await new ConfigurationEnvOptionRepo(ctx, env.id).getValueOptions();
  }
}
