import { Ctx, Resolver, Mutation, Arg } from 'type-graphql';
import { CreateBaseResolver, BaseTableResolver } from '../base.resolver';
import { Context } from '../server';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import UploadFilesRepo from '../../../features/repository/appExportImport.repository';
import { ExportedAppMetadata } from '../../../domain/entities/ExportedAppMetadata.entity';
import AppExportImportRepo from '../../../features/repository/appExportImport.repository';
export const ExportedAppInput = generateGraphQLInputType(
  ExportedAppMetadata,
  'ExportedAppInput',
  GenerationType.input
);

export const ExportedAppUpdateInput = generateGraphQLInputType(
  ExportedAppMetadata,
  'ExportedAppUpdateInput',
  GenerationType.update
);

@Resolver()
export class AppExportImportResolver extends CreateBaseResolver(
  'AppExportImport',
  AppExportImportRepo,
  ExportedAppMetadata,
  ExportedAppInput,
  ExportedAppUpdateInput
) {
  @Mutation(() => Boolean)
  async exportApp(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new AppExportImportRepo(ctx, id).exportApp();
    return true;
  }

  @Mutation(() => Boolean)
  async deleteExportedApp(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new AppExportImportRepo(ctx, id).deleteExportedApp();
    return true;
  }

  @Mutation(() => Boolean)
  async importApp(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new AppExportImportRepo(ctx, id).importApp();
    return true;
  }
}
