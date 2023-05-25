/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { v4 as uuidv4 } from 'uuid';
import coreRqlite from '../../coreRqlite';
import { ContainerVolumeTable, DeviceBackupTable, VolumeTable } from './tables';

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

  static async getVolumeOfContainer(containerId: string, volumeId: string): Promise<ContainerVolumeTable> {
    return (await coreRqlite.query([[`
        SELECT * FROM container_volume WHERE container_id = ? AND volume_id = ?
    `, containerId, volumeId]])).toArray()[0];
  }

  static async addVolumeToContainer(input: Partial<ContainerVolumeTable>): Promise<boolean> {
    await coreRqlite.execute([[`
        INSERT INTO container_volume (id, name, container_id, volume_id, inner_path, is_dynamic) VALUES (?, ?, ?, ?, ?, ?)
    `, input.id, input.name, input.container_id, input.volume_id, input.inner_path, input.is_dynamic.toString()]]);
    return true;
  }

  static async removeVolumeFromContainer(containerId: string, volumeId: string): Promise<boolean> {
    await coreRqlite.execute([[`
        DELETE FROM container_volume WHERE container_id = ? AND volume_id = ?
    `, containerId, volumeId]]);
    return true;
  }

  static async getDeviceBackups(deviceName: string): Promise<DeviceBackupTable[]> {
    return (await coreRqlite.query([[`
        SELECT * FROM device_backup WHERE device_name = ?
    `, deviceName]])).toArray();
  }

  static async getDeviceBackup(id: string): Promise<DeviceBackupTable> {
    return (await coreRqlite.query([[`
        SELECT * FROM device_backup WHERE id = ?
    `, id]])).toArray()[0];
  }

  static async setDeviceBackupVolume(deviceId: string, volumeId: string): Promise<boolean> {
    await coreRqlite.execute([[`
        UPDATE device SET backup_volume_id = ? WHERE id = ?
    `, volumeId, deviceId]]);
    return true;
  }

  static async removeDeviceBackupVolume(deviceId: string): Promise<boolean> {
    await coreRqlite.execute([[`
        UPDATE device SET backup_volume_id = NULL WHERE id = ?
    `, deviceId]]);
    return true;
  }

  static async addDeviceBackup(input: Partial<DeviceBackupTable>): Promise<string> {
    await coreRqlite.execute([[`
        INSERT INTO device_backup (id, name, device_id, container_id, image_id, device_name) VALUES (?, ?, ?, ?, ?, ?)
    `, input.id, input.name, input.device_id, input.container_id, input.image_id, input.device_name]]);
    return input.id;
  }

  static async deleteDeviceBackup(id: string): Promise<boolean> {
    await coreRqlite.execute([[`
        DELETE FROM device_backup WHERE id = ?
    `, id]]);
    return true;
  }
}

export default VolumeModel;