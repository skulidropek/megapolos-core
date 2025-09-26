import {
  Ctx,
  FieldResolver,
  Root,
  Resolver,
  Mutation,
  Arg,
} from 'type-graphql';
import { CreateBaseResolver, BaseTableResolver } from '../base.resolver';
import { App } from '../../../domain/entities/App.entity';
import { Image } from '../../../domain/entities/Image.entity';
import { Repository } from '../../../domain/entities/Repository.entity';
import { Context } from '../server';
import AppRepo from '../../../features/repository/app.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import { User } from '../../../domain/entities/User.entity';
import { AppVersion } from '../../../domain/entities/AppVersion.entity';
import AppVersionRepo from '../../../features/repository/app.version.repository';
import AppInstanceRepo from '../../../features/repository/app.instance.repository';
import { AppInstance } from '../../../domain/entities/AppInstance.entity';

export const AppInput = generateGraphQLInputType(
  App,
  'AppInput',
  GenerationType.input
);

export const AppUpdateInput = generateGraphQLInputType(
  App,
  'AppUpdateInput',
  GenerationType.update
);

@Resolver()
export class AppResolver extends CreateBaseResolver(
  'App',
  AppRepo,
  App,
  AppInput,
  AppUpdateInput
) {
  @Mutation(() => Boolean)
  async installApp(
    @Arg('input', () => AppInput) input: any,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new AppRepo(ctx).installApp(ctx.user.id, input);
    return true;
  }
}

@Resolver(() => App)
export class AppTableResolver extends BaseTableResolver {
  @FieldResolver(() => [Image])
  async images(@Root() app: App, @Ctx() ctx: Context): Promise<Image[]> {
    return await new AppRepo(ctx, app.id).getImages();
  }

  @FieldResolver(() => [Repository])
  async repositories(
    @Root() app: App,
    @Ctx() ctx: Context
  ): Promise<Repository[]> {
    return await new AppRepo(ctx, app.id).getRepositories();
  }

  @FieldResolver(() => User)
  async user(@Root() app: App, @Ctx() ctx: Context): Promise<User> {
    return (await new AppRepo(ctx, app.id).getUser()).getEntity();
  }

  @FieldResolver(() => [AppVersion])
  async appVersions(
    @Root() app: App,
    @Ctx() ctx: Context
  ): Promise<AppVersion[]> {
    return new AppVersionRepo(ctx).getByFields({ app: { id: app.id } });
  }

  @FieldResolver(() => [AppInstance])
  async instances(
    @Root() app: App,
    @Ctx() ctx: Context
  ): Promise<AppInstance[]> {
    return new AppInstanceRepo(ctx).getByFields({ app: { id: app.id } });
  }
}
