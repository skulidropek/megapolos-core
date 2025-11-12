import {
  Mutation,
  Ctx,
  FieldResolver,
  Root,
  Resolver,
  Arg,
  ID,
  InputType,
  Field,
} from 'type-graphql';
import { CreateBaseResolver, BaseTableResolver } from '../base.resolver';
import { AppInstance } from '../../../domain/entities/AppInstance.entity';
import { Container } from '../../../domain/entities/Container.entity';
import { Context } from '../server';
import AppInstanceRepo from '../../../features/repository/app.instance.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import { AppVersion } from '../../../domain/entities/AppVersion.entity';
import AppVersionRepo from '../../../features/repository/app.version.repository';

// Генерируем Input типы
export const AppInstanceInput = generateGraphQLInputType(
  AppInstance,
  'AppInstanceInput',
  GenerationType.input
);

export const AppInstanceUpdateInput = generateGraphQLInputType(
  AppInstance,
  'AppInstanceUpdateInput',
  GenerationType.update
);

@InputType()
class DomainDataInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  user?: string;

  @Field({ nullable: true })
  password?: string;
}

@InputType()
class DomainBindInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => DomainDataInput, { nullable: true })
  domainData?: DomainDataInput;
}

@InputType()
class DbDataInput {
  @Field()
  name!: string;

  @Field(() => ID)
  dbms!: string;
}

@InputType()
class DbUserDataInput {
  @Field()
  name!: string;

  @Field(() => ID)
  dbms!: string;

  @Field()
  password!: string;
}

@InputType()
class DbBindInnerInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => DbDataInput, { nullable: true })
  dbData?: DbDataInput;
}

@InputType()
class DbUserBindInnerInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => DbUserDataInput, { nullable: true })
  dbUserData?: DbUserDataInput;
}

@InputType()
class DbBindInput {
  @Field()
  role!: string;

  @Field(() => DbBindInnerInput)
  db!: DbBindInnerInput;

  @Field(() => DbUserBindInnerInput)
  dbUser!: DbUserBindInnerInput;
}

@InputType()
class VolumeDataInput {
  @Field()
  outerPath!: string;
}

@InputType()
class VolumeInnerInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => VolumeDataInput, { nullable: true })
  volumeData?: VolumeDataInput;
}

@InputType()
class VolumeBindDataInput {
  @Field()
  name!: string;

  @Field()
  role!: string;

  @Field()
  innerPath!: string;

  @Field(() => VolumeInnerInput)
  volume!: VolumeInnerInput;
}

@InputType()
class EnvVarInput {
  @Field()
  name!: string;

  @Field()
  value!: string;
}

@InputType()
export class ConfiguratedContainerInput {
  @Field()
  name!: string;

  @Field()
  role!: string;

  @Field(() => ID)
  node!: string;

  @Field(() => ID)
  image!: string;

  @Field()
  outerPort!: number;

  @Field(() => DomainBindInput, { nullable: true })
  domain?: DomainBindInput;

  @Field(() => [VolumeBindDataInput])
  volumes!: VolumeBindDataInput[];

  @Field(() => [DbBindInput])
  dbs!: DbBindInput[];

  @Field(() => [EnvVarInput])
  envs!: EnvVarInput[];
}

@InputType()
export class InstanceDataInput {
  @Field()
  name!: string;

  @Field(() => [ConfiguratedContainerInput])
  containers!: ConfiguratedContainerInput[];
}

@Resolver()
export class AppInstanceResolver extends CreateBaseResolver(
  'AppInstance',
  AppInstanceRepo,
  AppInstance,
  AppInstanceInput,
  AppInstanceUpdateInput
) {
  @Mutation(() => Boolean)
  async startAppInstance(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new AppInstanceRepo(ctx, id).start();
    return true;
  }

  @Mutation(() => Boolean)
  async stopAppInstance(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new AppInstanceRepo(ctx, id).stop();
    return true;
  }

  @Mutation(() => Boolean)
  async restartAppInstance(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    const instance = new AppInstanceRepo(ctx, id);
    await instance.stop();
    await instance.start();
    return true;
  }

  @Mutation(() => Boolean)
  async buildAppInstance(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new AppInstanceRepo(ctx, id).build();
    return true;
  }

  @Mutation(() => Boolean)
  async changeInstanceVersion(
    @Arg('instanceId') instanceId: string,
    @Arg('appVersionId') appVersionId: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new AppInstanceRepo(ctx, instanceId).changeInstanceVersion(
      appVersionId
    );
    return true;
  }

  @Mutation(() => Boolean)
  async changeInstancesVersion(
    @Arg('instancesIds', () => [String]) instancesIds: string[],
    @Arg('appVersionId') appVersionId: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new AppInstanceRepo(ctx).changeInstancesVersion(
      instancesIds,
      appVersionId
    );
    return true;
  }

  @Mutation(() => AppInstance)
  async createConfiguratedInstance(
    @Arg('appVersionId', () => ID) appVersionId: string,
    @Arg('instanceId', () => ID, { nullable: true }) instanceId: string | null,
    @Arg('instanceData', () => InstanceDataInput)
    instanceData: InstanceDataInput,
    @Ctx() ctx: Context
  ): Promise<AppInstance> {
    return new AppInstanceRepo(ctx).createConfiguratedInstance(
      appVersionId,
      instanceId,
      instanceData
    );
  }
}

@Resolver(() => AppInstance)
export class AppInstanceTableResolver extends BaseTableResolver {
  @FieldResolver(() => [Container])
  async containers(
    @Root() instance: AppInstance,
    @Ctx() ctx: Context
  ): Promise<Container[]> {
    return new AppInstanceRepo(ctx, instance.id).getContainers();
  }

  @FieldResolver(() => AppVersion, { nullable: true })
  async appVersion(
    @Root() instance: AppInstance,
    @Ctx() ctx: Context
  ): Promise<AppVersion> {
    if (!instance.appVersion) return null;

    return new AppVersionRepo(ctx, instance.appVersion.id).getEntity();
  }
}
