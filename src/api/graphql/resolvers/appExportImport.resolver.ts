import {
  Ctx,
  Resolver,
  Mutation,
  Arg,
  Query,
  ObjectType,
  Field,
  FieldResolver,
  Root,
} from 'type-graphql';
import { CreateBaseResolver, BaseTableResolver } from '../base.resolver';
import { Context } from '../server';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import { AppExport } from '../../../domain/entities/AppExport.entity';
import AppExportImportRepo from '../../../features/repository/appExportImport.repository';
import { FileUpload, GraphQLUpload, Upload } from 'graphql-upload-ts';
import { App } from '../../../domain/entities/App.entity';
import { JSONResolver } from 'graphql-scalars';
export const ExportedAppInput = generateGraphQLInputType(
  AppExport,
  'ExportedAppInput',
  GenerationType.input
);

export const ExportedAppUpdateInput = generateGraphQLInputType(
  AppExport,
  'ExportedAppUpdateInput',
  GenerationType.update
);

@ObjectType()
export class AppStoreVersion {
  @Field()
  id: string;
  @Field()
  version: string;
  @Field({ nullable: true })
  versionComment: string | null;
  @Field(() => Date, { nullable: true })
  versionCreated: Date | null;
}

@ObjectType()
export class AppsStoreList {
  @Field()
  id: string;
  @Field({ nullable: true })
  type: string | null;
  @Field()
  description: string;
  @Field({ nullable: true })
  iconUrl: string | null;
  @Field()
  name: string;
  @Field(() => [AppStoreVersion])
  versions: AppStoreVersion[];
}

// @Resolver(() => AppsStoreList)
// export class AppsStoreListResolver {
//   @FieldResolver(() => [String])
//   async versions(@Ctx() ctx: Context, @Root() app: AppsStoreList) {
//     return await new AppExportImportRepo(ctx, app.id).getAppStoreVersions();
//   }
// }

@Resolver()
export class AppExportImportResolver extends CreateBaseResolver(
  'AppExportImport',
  AppExportImportRepo,
  AppExport,
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
  async restoreApp(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new AppExportImportRepo(ctx, id).restoreApp();
    return true;
  }

  @Mutation(() => Boolean)
  async uploadAppConfig(
    @Arg('file', () => GraphQLUpload) file: Promise<FileUpload>,
    @Ctx() ctx: Context
  ) {
    await new AppExportImportRepo(ctx).uploadAppConfig(file);
    return true;
  }

  @Query(() => [AppsStoreList])
  async getListAppsStore(@Ctx() ctx: Context) {
    return await new AppExportImportRepo(ctx).getListAppsStore();
  }

  @Query(() => JSONResolver)
  async getAppStoreManifest(
    @Ctx() ctx: Context,
    @Arg('id') id: string,
    @Arg('versionId') versionId: string
  ) {
    return await new AppExportImportRepo(ctx, id).getAppStoreAppManifest(
      versionId
    );
  }

  @Query(() => [String])
  async getAppStoreVersions(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<string[]> {
    return await new AppExportImportRepo(ctx, id).getAppStoreVersions();
  }

  @Mutation(() => App)
  async installAppFromStore(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<App> {
    return await new AppExportImportRepo(ctx, id).installAppFromStore();
  }
}
