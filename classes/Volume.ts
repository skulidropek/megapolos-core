import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import fsSync from 'fs';

import { megapolosPath } from '..';
import VolumeModel from '../modules/models/volume.model';
import EventsObserver from '../modules/events/eventsObserver';
import { ContainerVolumeTable, VolumeTable } from '../modules/models/tables';
import MegapolosNode from './Node';
import Container from './Container';
import { ContainerInput, ContainerVolumeInput } from '../types';
import { promisify } from 'util';

const exec = promisify(require('child_process').exec);

class Volume {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  static async addVolume(input: Partial<VolumeTable>) {
    input = { ...input };
    const id = uuidv4();
    input.id = id;
        
    if (input.type === 'auto' || input.type === 'dynamic_auto') {
      const megapolosVolume = MegapolosNode.currentNode.getMegapolosPath() + '/volumes/' + id;
      if (!fsSync.existsSync(megapolosVolume)) {
        await fs.mkdir(megapolosVolume);
      }
      input.outer_path = megapolosVolume;
    }
    await VolumeModel.addVolume(input);
  }

  static async getVolumes(): Promise<Volume[]> {
    return (await VolumeModel.getVolumes()).map((volume) => new Volume(volume.id));
  }

  getData() {
    return VolumeModel.getVolume(this.id);
  }

  async delete(): Promise<void> {
    const volume = await this.getData();
    if (volume.type === 'auto' || volume.type === 'dynamic_auto') {
      const megapolosVolume = MegapolosNode.currentNode.getMegapolosPath() + '/volumes/' + this.id;
      if (fsSync.existsSync(megapolosVolume)) {
        await fs.rmdir(megapolosVolume, { recursive: true });
      }
    }
    await VolumeModel.deleteVolume(this.id);
  }

  async uploadFile(filename: string, data: string): Promise<void> {
    if (filename.match(/^.+$/) || filename.includes('/') || filename.includes('\\')) {
      throw new Error('Invalid filename');
    }
    const volume = await this.getData();
    if (!volume) {
      throw new Error('Volume not found');
    }
    await fs.writeFile(volume.outer_path + '/' + filename, data, 'base64');
  }

  async addToContainer(container: Container, input: ContainerVolumeInput): Promise<ContainerVolumeTable> {
    const volume = await this.getData();
    const volumeContainerId = uuidv4();
    if (input.is_dynamic) {
      const volumePath = MegapolosNode.currentNode.getMegapolosPath() + '/volumes/' + container.id + '/' + volumeContainerId;
      MegapolosNode.currentNode.validatePath(volumePath);
      await fs.mkdir(volumePath);
      await exec(`mount --bind ${volume.outer_path} ${volumePath}`);
    }
    await VolumeModel.addVolumeToContainer({
      id: volumeContainerId,
      container_id: container.id,
      volume_id: this.id,
      name: input.name,
      inner_path: input.is_dynamic ? '/megapolos/' + volumeContainerId : input.inner_path,
      is_dynamic: input.is_dynamic ? 1 : 0,
    });
    return VolumeModel.getVolumeOfContainer(container.id, this.id);
  }

  async removeFromContainer(container: Container): Promise<void> {
    const volumeContainer = await VolumeModel.getVolumeOfContainer(container.id, this.id);
    if (volumeContainer.is_dynamic) {
      const volumePath = MegapolosNode.currentNode.getMegapolosPath() + '/volumes/' + container.id + '/' + volumeContainer.id;
      MegapolosNode.currentNode.validatePath(volumePath);
      try {
        await exec(`umount ${volumePath}`);
      } catch (e) {
        console.error(e);
      }
      await fs.rmdir(volumePath);
    }
    await VolumeModel.removeVolumeFromContainer(container.id, this.id);
  }
}

export default Volume;