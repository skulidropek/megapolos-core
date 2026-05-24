import { v4 as uuidv4 } from 'uuid';
import fsSync from 'fs';
import BaseRepo from './base.repository';
import { Volume } from '../../domain/entities/Volume.entity';
import { makeEm, mem } from '../db/mikro-orm';
import { ContainerVolume } from '../../domain/entities/ContainerVolume.entity';
import NodeRepo from './megapolos.node.repository';
import { ContainerRepo } from './cantainer/container.repository';
import { RequiredEntityData } from '@mikro-orm/core';

import UserRepo from './user/user.repository';
import LogRepo from './log.repository';
import { LogType } from '../db/tables';

export default class VolumeRepo extends BaseRepo<Volume> {
  get entityClass() {
    return Volume;
  }

  async restore(
    containerId: string,
    archivePath: string,
    log?: LogRepo
  ): Promise<boolean> {
    const volume = await this.getEntity();
    if (!volume.outerPath) {
      throw new Error('Volume outerPath is not set');
    }

    const containerRepo = new ContainerRepo(this.ctx, containerId);
    const container = await containerRepo.getEntity();
    const nodeRepo = new NodeRepo(this.ctx, container.node.id);

    // 1. Upload archive to node
    const tempArchivePath = `/tmp/${uuidv4()}.zip`;
    await nodeRepo.uploadFile(archivePath, tempArchivePath);

    // 2. Clear volume directory and extract archive
    // We use sudo because volume folders are often owned by root or docker user
    await nodeRepo.shellCommand(
      `sudo apt-get update && sudo apt-get install -y unzip && sudo rm -rf ${volume.outerPath}/* && sudo unzip -o ${tempArchivePath} -d ${volume.outerPath} && sudo rm ${tempArchivePath}`,
      new UserRepo(undefined, ''),
      log
    ).output;

    return true;
  }

  async create(input: RequiredEntityData<Volume>): Promise<Volume> {
    const result = await super.create(input);
    if (input.type === 'auto' || input.type === 'dynamic_auto') {
      const megapolosVolume =
        NodeRepo.currentNode.getMegapolosPath() + '/volumes/' + result.id;
      if (!fsSync.existsSync(megapolosVolume)) {
        // await fs.mkdir(megapolosVolume);
      }
      input.outerPath = megapolosVolume;
    }
    return result;
  }

  async delete(): Promise<boolean> {
    const volume = await this.getEntity();
    if (volume.type === 'auto' || volume.type === 'dynamic_auto') {
      const megapolosVolume =
        NodeRepo.currentNode.getMegapolosPath() + '/volumes/' + this.id;
      if (fsSync.existsSync(megapolosVolume)) {
        // await fs.rmdir(megapolosVolume, { recursive: true });
      }
    }
    return super.delete();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async uploadFile(filename: string, data: string): Promise<void> {
    if (
      filename.match(/^.+$/) ||
      filename.includes('/') ||
      filename.includes('\\')
    ) {
      throw new Error('Invalid filename');
    }
    const volume = await this.getEntity();
    if (!volume) {
      throw new Error('Volume not found');
    }
    // await fs.writeFile(volume.outer_path + '/' + filename, data, 'base64');
  }

  async addToContainer(
    containerId: string,
    name: string,
    innerPath: string,
    role?: string
  ): Promise<ContainerVolume> {
    let volumeContainerId = uuidv4();
    return await (async () => {
      const em = this._getEM();
      const containerVolume = em.create(ContainerVolume, {
        id: volumeContainerId,
        container: containerId,
        volume: this.id,
        name,
        role,
        innerPath,
        isDynamic: 0,
      });
      await em.persistAndFlush(containerVolume);
      return containerVolume;
    })();
  }

  async removeFromContainer(containerVolumeId: string): Promise<boolean> {
    return (
      (await this._getEM().nativeDelete(ContainerVolume, {
        id: containerVolumeId,
      })) > 0
    );
  }

  async getVolumesOfContainer(containerId: string): Promise<ContainerVolume[]> {
    return await mem(async (em) => {
      return await em.find(
        ContainerVolume,
        { container: containerId },
        { populate: ['volume'] }
      );
    });
  }
}
