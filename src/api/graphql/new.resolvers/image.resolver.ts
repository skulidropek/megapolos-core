import {
  Query,
  Mutation,
  Ctx,
  FieldResolver,
  Root,
  Resolver,
  Arg,
  Info,
} from 'type-graphql';
import { CreateBaseResolver, BaseTableResolver } from '../base.resolver';
import { Image } from '../../../domain/entities/Image.entity';
import { Repository } from '../../../domain/entities/Repository.entity';
import { Log } from '../../../domain/entities/Log.entity';
import { Context } from '../server';
import ImageRepo from '../../../features/new.repository/image.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import RepositoryRepo from '../../../features/new.repository/repository.repository';
import { GraphQLResolveInfo } from 'graphql';

// Генерируем Input типы
export const ImageInput = generateGraphQLInputType(
  Image,
  'ImageInput',
  GenerationType.input
);

export const ImageUpdateInput = generateGraphQLInputType(
  Image,
  'ImageUpdateInput',
  GenerationType.update
);

@Resolver()
export class ImageResolver extends CreateBaseResolver(
  'Image',
  ImageRepo,
  Image,
  ImageInput,
  ImageUpdateInput
) {
  @Mutation(() => Boolean)
  async buildImage(
    @Arg('imageId') imageId: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new ImageRepo(ctx, imageId).build();
    return true;
  }

  @Mutation(() => Boolean)
  async buildImages(
    @Arg('imageIds', () => [String]) imageIds: string[],
    @Ctx() ctx: Context
  ): Promise<boolean> {
    for (const imageId of imageIds) {
      await new ImageRepo(ctx, imageId).build();
    }
    return true;
  }

  @Mutation(() => Boolean)
  async updateNodesOfImage(
    @Arg('imageId') imageId: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new ImageRepo(ctx, imageId).updateNodes();
    return true;
  }
}

@Resolver(() => Image)
export class ImageTableResolver extends BaseTableResolver {
  @FieldResolver(() => Repository, { nullable: true })
  async repository(
    @Root() image: Image,
    @Info() info: GraphQLResolveInfo,
    @Ctx() ctx: Context
  ): Promise<Repository | null> {
    return this.returnOnlyIdIfNeeded(info, image.repository.id, () =>
      new RepositoryRepo(ctx, image.repository.id).getEntity()
    );
  }

  @FieldResolver(() => [Log])
  async lastBuildLog(@Root() image: Image, @Ctx() ctx: Context): Promise<Log> {
    return new ImageRepo(ctx, image.id).getLastBuildLog();
  }
}
