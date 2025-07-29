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
import { AppVersion} from '../../../domain/entities/AppVersion.entity';
import { Container } from '../../../domain/entities/Container.entity';
import { Context } from '../server';
import AppVersionRepo from '../../../features/repository/app.version.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';

@InputType()
class AppVersionInput {
  @Field()
  image_id: string;

  @Field()
  image_data: string;
}

@Resolver()
export class AppVersionResolver extends CreateBaseResolver(
  'AppVersion',
  AppVersionRepo,
  AppVersion,
  AppVersionInput
) {
  @Mutation(() => Boolean)
  async createAppVersion(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new AppVersionRepo(ctx, id).createAppVersion();
    return true;
  }
}
