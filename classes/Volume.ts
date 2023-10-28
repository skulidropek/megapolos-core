import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import fsSync from 'fs';

import { megapolosPath } from '..';
import VolumeModel from '../modules/models/volume.model';
import EventsObserver from '../modules/events/eventsObserver';
import { VolumeTable } from '../modules/models/tables';

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
      const megapolosVolume = megapolosPath + '/volumes/' + id;
      if (!fsSync.existsSync(megapolosVolume)) {
        await fs.mkdir(megapolosVolume);
      }
      input.outer_path = megapolosVolume;
    }
    await VolumeModel.addVolume(input);
  }

  getData() {
    return VolumeModel.getVolume(this.id);
  }

  async delete(): Promise<void> {
    const volume = await this.getData();
    if (volume.type === 'auto' || volume.type === 'dynamic_auto') {
      const megapolosVolume = megapolosPath + '/volumes/' + this.id;
      if (fsSync.existsSync(megapolosVolume)) {
        await fs.rmdir(megapolosVolume, { recursive: true });
      }
    }
    await VolumeModel.deleteVolume(this.id);
  }
}

export default Volume;