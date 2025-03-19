import { v4 as uuidv4 } from 'uuid';
import fsSync from 'fs';
import { ContainerVolumeTable, VolumeTable } from '../modules/models/tables';
import MegapolosNode from './Node';
import { ContainerVolumeInput } from '../types';
import { promisify } from 'util';
import BaseRepository from './BaseRepository';
import { knex } from '../corePostgres';

const exec = promisify(require('child_process').exec);

class Volume extends BaseRepository<VolumeTable> {
  getTable(): string {
    return 'volume';
  }

  async create(input: Partial<VolumeTable>): Promise<VolumeTable> {
    const result = await super.create(input);
    if (input.type === 'auto' || input.type === 'dynamic_auto') {
      const megapolosVolume = MegapolosNode.currentNode.getMegapolosPath() + '/volumes/' + result.id;
      if (!fsSync.existsSync(megapolosVolume)) {
        // await fs.mkdir(megapolosVolume);
      }
      input.outer_path = megapolosVolume;
    }
    return result;
  }

  async delete(): Promise<boolean> {
    const volume = await this.getData();
    if (volume.type === 'auto' || volume.type === 'dynamic_auto') {
      const megapolosVolume = MegapolosNode.currentNode.getMegapolosPath() + '/volumes/' + this.id;
      if (fsSync.existsSync(megapolosVolume)) {
        // await fs.rmdir(megapolosVolume, { recursive: true });
      }
    }
    return super.delete();
  }

  async uploadFile(filename: string, data: string): Promise<void> {
    if (filename.match(/^.+$/) || filename.includes('/') || filename.includes('\\')) {
      throw new Error('Invalid filename');
    }
    const volume = await this.getData();
    if (!volume) {
      throw new Error('Volume not found');
    }
    // await fs.writeFile(volume.outer_path + '/' + filename, data, 'base64');
  }

  async addToContainer(containerId: string, input: ContainerVolumeInput): Promise<ContainerVolumeTable> {
    const volumeContainerId = uuidv4();
    if (input.is_dynamic) {
      // const volumePath = MegapolosNode.currentNode.getMegapolosPath() + '/volumes/' + container.id + '/' + volumeContainerId;
      // MegapolosNode.currentNode.validatePath(volumePath);
      // // await fs.mkdir(volumePath);
      // await exec(`mount --bind ${volume.outer_path} ${volumePath}`);
    }
    await knex<ContainerVolumeTable>('container_volume').insert({
      id: volumeContainerId,
      container_id: containerId,
      volume_id: this.id,
      name: input.name,
      inner_path: input.is_dynamic ? '/megapolos/' + volumeContainerId : input.inner_path,
      is_dynamic: input.is_dynamic ? 1 : 0,
    });
    return knex<ContainerVolumeTable>('container_volume').select('*').where('id', volumeContainerId).first();
  }

  async removeFromContainer(containerVolumeId: string): Promise<boolean> {
    await knex<ContainerVolumeTable>('container_volume').delete().where('id', containerVolumeId);
    return true;
  }

  async getVolumesOfContainer(containerId: string): Promise<ContainerVolumeTable[]> {
    return knex<ContainerVolumeTable>('container_volume').select('*').where({
      container_id: containerId,
    });
  }

}

export default Volume;