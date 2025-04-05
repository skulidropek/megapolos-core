import { Ctx, FieldResolver, Root, Resolver } from 'type-graphql';
import { CreateBaseResolver, BaseTableResolver } from '../base.resolver';
import { App } from '../../../domain/entities/App.entity';
import { Image } from '../../../domain/entities/Image.entity';
import { Repository } from '../../../domain/entities/Repository.entity';
import { Context } from '../server';
import AppRepo from '../../../features/new.repository/app.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';

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
) {}

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
}
