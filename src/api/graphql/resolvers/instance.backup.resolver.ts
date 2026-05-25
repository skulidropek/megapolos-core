import {
  Resolver,
  Query,
  Arg,
  Ctx,
  FieldResolver,
  Root,
  Mutation,
  Float,
} from 'type-graphql';
import { BaseTableResolver } from '../base.resolver';
import { AppInstanceBackup } from '../../../domain/entities/AppInstanceBackup.entity';
import { AppInstance } from '../../../domain/entities/AppInstance.entity';
import { Artifact } from '../../../domain/entities/Artifact.entity';
import { Context } from '../server';
import AppInstanceBackupRepo from '../../../features/repository/app.instance.backup.repository';
import AppInstanceRepo from '../../../features/repository/app.instance.repository';
import ArtifactRepo from '../../../features/repository/artifact.repository';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import jwt from 'jsonwebtoken';
import config from '../../../domain/config/config';

@Resolver()
export class AppInstanceBackupResolver {
  @Query(() => AppInstanceBackup)
  async getAppInstanceBackup(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<AppInstanceBackup> {
    return new AppInstanceBackupRepo(ctx, id).getEntity();
  }

  @Query(() => [AppInstanceBackup])
  async getAppInstanceBackups(@Ctx() ctx: Context): Promise<AppInstanceBackup[]> {
    return new AppInstanceBackupRepo(ctx).getAll();
  }

  @Mutation(() => AppInstanceBackup)
  async uploadInstanceBackup(
    @Arg('file', () => GraphQLUpload) file: Promise<FileUpload>,
    @Ctx() ctx: Context
  ): Promise<AppInstanceBackup> {
    return new AppInstanceBackupRepo(ctx).uploadBackup(file);
  }

  @Mutation(() => Boolean)
  async deleteAppInstanceBackup(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    return new AppInstanceBackupRepo(ctx, id).delete();
  }

  @Query(() => String)
  async getArtifactDownloadUrl(
    @Arg('artifactId') artifactId: string,
    @Ctx() ctx: Context
  ): Promise<string> {
    const artifact = await new ArtifactRepo(ctx, artifactId).getEntity();
    const token = jwt.sign(
      { 
        id: ctx.user.id, 
        artifactId: artifact.id,
        exp: Math.floor(Date.now() / 1000) + 10 
      }, 
      config.secret
    );
    return `/api/artifact/download/${artifact.id}?token=${token}`;
  }
}

@Resolver(() => AppInstanceBackup)
export class AppInstanceBackupTableResolver extends BaseTableResolver {
  @FieldResolver(() => AppInstance, { nullable: true })
  async appInstance(
    @Root() backup: AppInstanceBackup,
    @Ctx() ctx: Context
  ): Promise<AppInstance | null> {
    if (!backup.appInstance) return null;
    return new AppInstanceRepo(ctx, backup.appInstance.id).getEntity();
  }

  @FieldResolver(() => Artifact, { nullable: true })
  async artifact(
    @Root() backup: AppInstanceBackup,
    @Ctx() ctx: Context
  ): Promise<Artifact | null> {
    if (!backup.artifact) return null;
    return new ArtifactRepo(ctx, backup.artifact.id).getEntity();
  }

  @FieldResolver(() => Float, { nullable: true })
  async size(
    @Root() backup: AppInstanceBackup,
    @Ctx() ctx: Context
  ): Promise<number | undefined> {
    if (!backup.artifact) {
      return 0;
    }
    return new ArtifactRepo(ctx, backup.artifact.id).getSize();
  }
}
