import { Ctx, Resolver, Mutation, Arg } from 'type-graphql';
import { CreateBaseResolver, BaseTableResolver } from '../base.resolver';
import { Context } from '../server';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import UploadFilesRepo from '../../../features/repository/uploadFiles.repository';
import { UploadedFiles } from '../../../domain/entities/UploadedFiles.entity';
export const UploadInput = generateGraphQLInputType(
  UploadedFiles,
  'UploadInput',
  GenerationType.input
);

export const UploadUpdateInput = generateGraphQLInputType(
  UploadedFiles,
  'UploadUpdateInput',
  GenerationType.update
);

@Resolver()
export class UploadResolver extends CreateBaseResolver(
  'Upload',
  UploadFilesRepo,
  UploadedFiles,
  UploadInput,
  UploadUpdateInput
) {
  @Mutation(() => Boolean)
  async exportApp(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new UploadFilesRepo(ctx, id).exportApp();
    return true;
  }

  @Mutation(() => Boolean)
  async deleteExportedApp(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new UploadFilesRepo(ctx, id).deleteExportedApp();
    return true;
  }
}
