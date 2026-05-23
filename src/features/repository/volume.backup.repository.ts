import { VolumeBackup } from '../../domain/entities/VolumeBackup.entity';
import ArtifactRepo from './artifact.repository';
import BaseRepo from './base.repository';
import VolumeRepo from './volume.repository';
import LogRepo from './log.repository';
import { LogType } from '../db/tables';
import NodeRepo from './megapolos.node.repository';
import UserRepo from './user/user.repository';
import { v4 as uuidv4 } from 'uuid';
import fse from 'fs-extra';
import { megapolosPath } from '../../..';

export default class VolumeBackupRepo extends BaseRepo<VolumeBackup> {
  get entityClass() {
    return VolumeBackup;
  }

  async backup(volumeRepo: VolumeRepo, customName?: string): Promise<VolumeBackup> {
    const volume = await volumeRepo.getEntity();
    const artifactRepo = new ArtifactRepo(this.ctx);
    const backupName = customName || ('Backup volume ' + volume.name);
    const artifact = await artifactRepo.create({
      name: backupName,
      type: 'volume_backup',
    });

    const volumeBackup = await this.create({
      name: backupName,
      artifact: artifact,
      volume: volume,
    });

    const log = new LogRepo(this.ctx);
    await log.create({
      name: backupName,
      type: LogType.VolumeBackup,
      objectId: volumeBackup.id,
      objectName: volumeBackup.name,
    });

    const nodeRepo = volume.nodeId
      ? new NodeRepo(this.ctx, volume.nodeId)
      : NodeRepo.currentNode;

    const artifactPath = await artifactRepo.getPath();
    const tempZipName = uuidv4() + '.zip';
    const remoteTempZipPath = '/tmp/' + tempZipName;
    const localZipPath = artifactPath + '/backup.zip';

    try {
      if (volume.outerPath) {
        // Zip the volume directory on the node
        await nodeRepo.shellCommand(
          `cd ${volume.outerPath} && zip -r ${remoteTempZipPath} .`,
          new UserRepo(undefined, ''),
          log
        ).output;

        // Download to local artifact directory
        await nodeRepo.downloadFile(remoteTempZipPath, localZipPath);

        // Cleanup remote temp file
        await nodeRepo.shellCommand(
          `rm ${remoteTempZipPath}`,
          new UserRepo(undefined, ''),
          log
        ).output;
      }
    } catch (e) {
      await log.close();
      throw e;
    }

    await log.close();
    return volumeBackup;
  }
}
