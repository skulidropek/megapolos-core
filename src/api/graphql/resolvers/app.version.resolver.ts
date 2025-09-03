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

export const AppVersionInput = generateGraphQLInputType(
  AppVersion,
  'AppVersionInput',
  GenerationType.input
);

@InputType()
export class AppVersionImageInput {
  @Field()
  image_id?: string;

  @Field(() => ImageInput)
  image_data?: typeof ImageInput;
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
    @Arg('app_version_data', () => AppVersionInput)
    app_version_data: typeof AppVersionInput,
    @Arg('images', () => [AppVersionImageInput]) images: AppVersionImageInput[],
    @Ctx() ctx: Context
  ): Promise<AppVersion> {
    const repo = new AppVersionRepo(ctx);
    return repo.createAppVersion(app_version_data, images);
  }
}
