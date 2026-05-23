import {
  Resolver,
  Query,
  Arg,
  Ctx,
  FieldResolver,
  Root,
  Mutation,
} from 'type-graphql';
import { BaseTableResolver } from '../base.resolver';
import { VolumeBackup } from '../../../domain/entities/VolumeBackup.entity';
import { Volume } from '../../../domain/entities/Volume.entity';
import { Artifact } from '../../../domain/entities/Artifact.entity';
import { Context } from '../server';
import VolumeBackupRepo from '../../../features/repository/volume.backup.repository';
import VolumeRepo from '../../../features/repository/volume.repository';
import ArtifactRepo from '../../../features/repository/artifact.repository';

@Resolver()
export class VolumeBackupResolver {
  @Query(() => VolumeBackup)
  async getVolumeBackup(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<VolumeBackup> {
    return new VolumeBackupRepo(ctx, id).getEntity();
  }

  @Query(() => [VolumeBackup])
  async getVolumeBackups(@Ctx() ctx: Context): Promise<VolumeBackup[]> {
    return new VolumeBackupRepo(ctx).getAll();
  }

  @Mutation(() => VolumeBackup)
  async backupVolume(
    @Arg('volumeId') volumeId: string,
    @Ctx() ctx: Context
  ): Promise<VolumeBackup> {
    const volumeRepo = new VolumeRepo(ctx, volumeId);
    return new VolumeBackupRepo(ctx).backup(volumeRepo);
  }
}

@Resolver(() => VolumeBackup)
export class VolumeBackupTableResolver extends BaseTableResolver {
  @FieldResolver(() => Volume, { nullable: true })
  async volume(
    @Root() volumeBackup: VolumeBackup,
    @Ctx() ctx: Context
  ): Promise<Volume | null> {
    if (!volumeBackup.volume) return null;
    return new VolumeRepo(ctx, volumeBackup.volume.id).getEntity();
  }

  @FieldResolver(() => Artifact, { nullable: true })
  async artifact(
    @Root() volumeBackup: VolumeBackup,
    @Ctx() ctx: Context
  ): Promise<Artifact | null> {
    if (!volumeBackup.artifact) return null;
    return new ArtifactRepo(ctx, volumeBackup.artifact.id).getEntity();
  }
}
