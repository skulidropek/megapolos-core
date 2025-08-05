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

export @InputType()
class AppVersionInput {
  @Field()
  image_id: string;

  @Field({ nullable: true })
  image_data: Image;
}

export @InputType()
class AppVersionUpdateInput {
  @Field()
  app_id!: string;

  @Field()
  build_number!: number;

  @Field()
  version!: string;

  @Field({ nullable: true })
  version_comment?: string;
}

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
    @Arg('data') data: AppVersionInput,
    @Ctx() ctx: Context
  ): Promise<AppVersion> {
    const repo = new AppVersionRepo(ctx);
    return repo.create(data);
  }
}
