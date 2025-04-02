import { v4 as uuidv4 } from 'uuid';
import fsSync from 'fs';
import { ContainerVolumeInput } from '../../domain/types';
import BaseRepo from './base.repository';
import { Volume } from '../../domain/entities/Volume.entity';
import { makeEm, mem } from '../db/mikro-orm';
import { ContainerVolume } from '../../domain/entities/ContainerVolume.entity';
import MegapolosNodeRepo from './megapolos.node.repository';
import MegapolosNode from '../repository/Node';
import { RequiredEntityData } from '@mikro-orm/core';

export default class VolumeRepo extends BaseRepo<Volume> {
  get entityClass() {
    return Volume;
  }

  async create(input: RequiredEntityData<Volume>): Promise<Volume> {
    const result = await super.create(input);
    if (input.type === 'auto' || input.type === 'dynamic_auto') {
      const megapolosVolume =
        MegapolosNodeRepo.currentNode.getMegapolosPath() +
        '/volumes/' +
        result.id;
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
        MegapolosNode.currentNode.getMegapolosPath() + '/volumes/' + this.id;
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
    input: ContainerVolumeInput
  ): Promise<ContainerVolume> {
    let volumeContainerId = uuidv4();
    if (input.is_dynamic) {
      // const volumePath = MegapolosNode.currentNode.getMegapolosPath() + '/volumes/' + container.id + '/' + volumeContainerId;
      // MegapolosNode.currentNode.validatePath(volumePath);
      // // await fs.mkdir(volumePath);
      // await exec(`mount --bind ${volume.outer_path} ${volumePath}`);
    }

    return await mem(async (em) => {
      const containerVolume = em.create(ContainerVolume, {
        id: volumeContainerId,
        container: containerId,
        volume: this.id,
        name: input.name,
        innerPath: input.is_dynamic
          ? '/megapolos/' + volumeContainerId
          : input.inner_path,
        isDynamic: input.is_dynamic ? 1 : 0,
      });
      await em.persistAndFlush(containerVolume);
      return containerVolume;
    });
  }

  async removeFromContainer(containerVolumeId: string): Promise<boolean> {
    return (
      (await makeEm().nativeDelete(ContainerVolume, {
        id: containerVolumeId,
      })) > 0
    );
  }

  async getVolumesOfContainer(containerId: string): Promise<ContainerVolume[]> {
    return await mem(async (em) => {
      return await em.find(ContainerVolume, { container: containerId });
    });
  }
}
