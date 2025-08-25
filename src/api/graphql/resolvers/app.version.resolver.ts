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

@InputType()
export class AppVersionInput {
  @Field()
  app_id!: string;

  @Field()
  build_number!: number;

  @Field()
  version?: string;

  @Field({ nullable: true })
  version_comment?: string;

  toStruct() {
    return {
      app_id: this.app_id,
      build_number: this.build_number,
      version: this.version,
      version_comment: this.version_comment,
    };
  }
}

@InputType()
export class AppVersionImageInput {
  @Field()
  image_id?: string;

  @Field({ nullable: true })
  image_data?: Image;
}

@InputType()
export class AppVersionUpdateInput {
  @Field()
  build_number!: number;

  @Field()
  version?: string;

  @Field({ nullable: true })
  version_comment?: string;

  toStruct() {
    return {
      build_number: this.build_number,
      version: this.version,
      version_comment: this.version_comment,
    };
  }
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
    @Arg('app_version_data') app_version_data: AppVersionInput,
    @Arg('images') images: AppVersionImageInput[],
    @Ctx() ctx: Context
  ): Promise<AppVersion> {
    const repo = new AppVersionRepo(ctx);
    return repo.createAppVersion(app_version_data, images);
  }
}
