import {
  Mutation,
  Ctx,
  FieldResolver,
  Root,
  Resolver,
  Arg,
} from 'type-graphql';
import { CreateBaseResolver, BaseTableResolver } from '../base.resolver';
import { AppInstance } from '../../../domain/entities/AppInstance.entity';
import { Container } from '../../../domain/entities/Container.entity';
import { Context } from '../server';
import AppInstanceRepo from '../../../features/new.repository/app.instance.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';

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
}
