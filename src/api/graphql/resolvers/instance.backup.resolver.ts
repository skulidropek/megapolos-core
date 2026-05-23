import {
  Resolver,
  Query,
  Arg,
  Ctx,
  FieldResolver,
  Root,
} from 'type-graphql';
import { BaseTableResolver } from '../base.resolver';
import { AppInstanceBackup } from '../../../domain/entities/AppInstanceBackup.entity';
import { AppInstance } from '../../../domain/entities/AppInstance.entity';
import { Artifact } from '../../../domain/entities/Artifact.entity';
import { Context } from '../server';
import AppInstanceBackupRepo from '../../../features/repository/app.instance.backup.repository';
import AppInstanceRepo from '../../../features/repository/app.instance.repository';
import ArtifactRepo from '../../../features/repository/artifact.repository';

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
}
