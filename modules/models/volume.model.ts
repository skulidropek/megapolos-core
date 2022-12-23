import { v4 as uuidv4 } from 'uuid';
import coreRqlite from '../../coreRqlite';
import { ContainerVolumeTable, VolumeTable } from './tables';

class VolumeModel {
  static async getVolumes(): Promise<VolumeTable[]> {
    return (await coreRqlite.query([[`
        SELECT * FROM volume
    `]])).toArray();
  }

  static async getVolume(id: string): Promise<VolumeTable> {
    return (await coreRqlite.query([[`
        SELECT * FROM volume WHERE id = ?
    `, id]])).toArray()[0];
  }

  static async addVolume(input: Partial<VolumeTable>):Promise<string> {
    await coreRqlite.execute([[`
        INSERT INTO volume (id, name, type, outer_path) VALUES (?, ?, ?, ?)
    `, input.id, input.name, input.type, input.outer_path]]);
    return input.id;
  }

  static async deleteVolume(id: string): Promise<boolean> {
    await coreRqlite.execute([[`
        DELETE FROM volume WHERE id = ?
    `, id]]);
    return true;
  }

  static async getVolumesOfContainer(containerId: string): Promise<ContainerVolumeTable[]> {
    return (await coreRqlite.query([[`
        SELECT * FROM container_volume WHERE container_id = ?
    `, containerId]])).toArray();
  }

  static async addVolumeToContainer(input: Partial<ContainerVolumeTable>): Promise<boolean> {
    await coreRqlite.execute([[`
        INSERT INTO container_volume (id, name, container_id, volume_id, inner_path) VALUES (?, ?, ?, ?, ?)
    `, input.id, input.name, input.container_id, input.volume_id, input.inner_path]]);
    return true;
  }

  static async deleteVolumeFromContainer(id: string): Promise<boolean> {
    await coreRqlite.execute([[`
        DELETE FROM container_volume WHERE id = ?
    `, id]]);
    return true;
  }
}

export default VolumeModel;