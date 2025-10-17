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
  Configuraion,
  ConfiguraionService,
  ConfigurationDbWithUser,
  ConfigurationEnvOption,
  ConfigurationPort,
  ConfigurationVolume,
} from '../../../domain/entities/configuration/Configuraion.entity';
import {
  ConfiguraionRepo,
  ConfiguraionServiceRepo,
  ConfigurationEnvOptionRepo,
} from '../../../features/repository/configuraion.repository';
import { App } from '../../../domain/entities/App.entity';
import AppRepo from '../../../features/repository/app.repository';

@Resolver()
export class ConfiguraionResolver {
  //createConfiguration(appId, configurationData)
  //deleteConfiguration(configurationId)
}

@Resolver(() => Configuraion)
export class ConfiguraionFieldsResolver {
  @FieldResolver(() => App)
  async app(
    @Root() configuraion: Configuraion,
    @Ctx() ctx: Context
  ): Promise<App> {
    return new AppRepo(ctx, configuraion.app.id).getEntity();
  }

  @FieldResolver(() => [ConfiguraionService])
  async services(
    @Root() configuraion: Configuraion,
    @Ctx() ctx: Context
  ): Promise<ConfiguraionService[]> {
    return await new ConfiguraionRepo(ctx, configuraion.id).getServices();
  }
}

@Resolver(() => ConfiguraionService)
export class ConfiguraionServiceFieldsResolver {
  @FieldResolver(() => [ConfigurationVolume])
  async volumes(
    @Root() service: ConfiguraionService,
    @Ctx() ctx: Context
  ): Promise<ConfigurationVolume[]> {
    return await new ConfiguraionServiceRepo(ctx, service.id).getVolumes();
  }

  @FieldResolver(() => [ConfigurationPort])
  async ports(
    @Root() service: ConfiguraionService,
    @Ctx() ctx: Context
  ): Promise<ConfigurationPort[]> {
    return await new ConfiguraionServiceRepo(ctx, service.id).getPorts();
  }

  @FieldResolver(() => [ConfigurationDbWithUser])
  async dbs(
    @Root() service: ConfiguraionService,
    @Ctx() ctx: Context
  ): Promise<ConfigurationDbWithUser[]> {
    return await new ConfiguraionServiceRepo(ctx, service.id).getDbs();
  }

  @FieldResolver(() => [ConfigurationEnvOption])
  async envs(
    @Root() service: ConfiguraionService,
    @Ctx() ctx: Context
  ): Promise<ConfigurationEnvOption[]> {
    return await new ConfiguraionServiceRepo(ctx, service.id).getEnvs();
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
