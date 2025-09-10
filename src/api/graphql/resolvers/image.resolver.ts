import {
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
import ImageRepo from '../../../features/repository/image.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import RepositoryRepo from '../../../features/repository/repository.repository';
import { GraphQLResolveInfo } from 'graphql';
import { App } from '../../../domain/entities/App.entity';
import { ImageEnvRequirement } from '../../../domain/entities/ImageEnvRequirement.entity';
import { resources } from '../../../features/rights/resources.list';

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

export const ImageEnvRequirementInput = generateGraphQLInputType(
  ImageEnvRequirement,
  'ImageEnvRequirementInput',
  GenerationType.input
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
    var imageRepo = new ImageRepo(ctx, imageId);
    await imageRepo.checkActionAccess(resources.image.actions.build);

    void imageRepo.build(); //!!! fire-and-forget execution
    return true;
  }

  @Mutation(() => Boolean)
  async buildImages(
    @Arg('imageIds', () => [String]) imageIds: string[],
    @Ctx() ctx: Context
  ): Promise<boolean> {
    for (const imageId of imageIds) {
      var imageRepo = new ImageRepo(ctx, imageId);
      await imageRepo.checkActionAccess(resources.image.actions.build);

      void imageRepo.build(); //!!! fire-and-forget execution
    }

    return true;
  }

  @Mutation(() => Boolean)
  async updateNodesOfImage(
    @Arg('imageId') imageId: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    var imageRepo = new ImageRepo(ctx, imageId);
    await imageRepo.checkActionAccess(resources.image.actions.update_nodes);

    void imageRepo.updateNodes(); //!!! fire-and-forget execution
    return true;
  }

  @Mutation(() => Boolean)
  async changeImageEnvs(
    @Arg('imageId') imageId: string,
    @Arg('envs', () => [ImageEnvRequirementInput])
    envs: (typeof ImageEnvRequirementInput)[],
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new ImageRepo(ctx, imageId).changeEnvs(envs);
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

  @FieldResolver(() => App)
  async app(@Root() image: Image, @Ctx() ctx: Context): Promise<App | null> {
    return (await new ImageRepo(ctx, image.id).getAppRepo()).getEntity();
  }

  @FieldResolver(() => [Log])
  async lastBuildLog(@Root() image: Image, @Ctx() ctx: Context): Promise<Log> {
    return new ImageRepo(ctx, image.id).getLastBuildLog();
  }

  @FieldResolver(() => [ImageEnvRequirement])
  async envs(
    @Root() image: Image,
    @Ctx() ctx: Context
  ): Promise<ImageEnvRequirement[]> {
    return new ImageRepo(ctx, image.id).getEnvs();
  }
}
