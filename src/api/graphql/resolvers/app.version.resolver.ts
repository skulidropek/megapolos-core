import {
  Mutation,
  Ctx,
  FieldResolver,
  Root,
  Resolver,
  Arg,
  InputType,
  Field,
} from 'type-graphql';
import { CreateBaseResolver, BaseTableResolver } from '../base.resolver';
import { AppVersion } from '../../../domain/entities/AppVersion.entity';
import { Container } from '../../../domain/entities/Container.entity';
import { Context } from '../server';
import AppVersionRepo from '../../../features/repository/app.version.repository';
import { Image } from '../../../domain/entities/Image.entity';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import { ImageInput } from './image.resolver';
import { App } from '../../../domain/entities/App.entity';
import AppRepo from '../../../features/repository/app.repository';

export const AppVersionInput = generateGraphQLInputType(
  AppVersion,
  'AppVersionInput',
  GenerationType.input
);

@InputType()
export class AppVersionImageInput {
  @Field({ nullable: true })
  imageId?: string;

  @Field(() => ImageInput, { nullable: true })
  imageData?: typeof ImageInput;
}

export const AppVersionUpdateInput = generateGraphQLInputType(
  AppVersion,
  'AppVersionUpdateInput',
  GenerationType.update
);

@Resolver()
export class AppVersionResolver extends CreateBaseResolver(
  'AppVersion',
  AppVersionRepo,
  AppVersion,
  AppVersionInput,
  AppVersionUpdateInput
) {
  @Mutation(() => AppVersion)
  async createAppVersion(
    @Arg('appVersionData', () => AppVersionInput)
    appVersionData: typeof AppVersionInput,
    @Arg('images', () => [AppVersionImageInput]) images: AppVersionImageInput[],
    @Ctx() ctx: Context
  ): Promise<AppVersion> {
    const repo = new AppVersionRepo(ctx);
    return repo.createAppVersion(appVersionData, images);
  }
}

@Resolver(() => AppVersion)
export class AppVersionTableResolver extends BaseTableResolver {
  @FieldResolver(() => [Image])
  async images(
    @Root() appVersion: AppVersion,
    @Ctx() ctx: Context
  ): Promise<Image[]> {
    return await new AppVersionRepo(ctx, appVersion.id).getImages();
  }

  @FieldResolver(() => App)
  async app(@Root() appVersion: AppVersion, @Ctx() ctx: Context): Promise<App> {
    return await new AppRepo(ctx, appVersion.app.id).getEntity();
  }
}
