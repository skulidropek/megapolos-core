/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { knex } from '../../coreRqlite';
import { ContainerVolumeTable, DeviceBackupTable, DeviceTable, VolumeTable } from './tables';

class VolumeModel {
  static async getVolumes(): Promise<VolumeTable[]> {
    return knex<VolumeTable>('volume').select('volume.*');
  }

  static async getVolume(id: string): Promise<VolumeTable> {
    return knex<VolumeTable>('volume').select('volume.*').where('volume.id', id).first();
  }

  static async addVolume(input: Partial<VolumeTable>):Promise<string> {
    await knex<VolumeTable>('volume').insert(input);
    return input.id;
  }

  static async deleteVolume(id: string): Promise<boolean> {
    await knex<VolumeTable>('volume').delete().where('id', id);
    return true;
  }

  static async getVolumesOfContainer(containerId: string): Promise<ContainerVolumeTable[]> {
    return knex<ContainerVolumeTable>('container_volume').select('container_volume.*').where('container_volume.container_id', containerId);
  }

  static async getVolumeOfContainer(containerId: string, volumeId: string): Promise<ContainerVolumeTable> {
    return knex<ContainerVolumeTable>('container_volume').
      select('container_volume.*').where({
        container_id: containerId,
        volume_id: volumeId,
      }).first();
  }

  static async addVolumeToContainer(input: Partial<ContainerVolumeTable>): Promise<boolean> {
    await knex<ContainerVolumeTable>('container_volume').insert(input);
    return true;
  }

  static async removeVolumeFromContainer(containerVolumeId): Promise<boolean> {
    await knex<ContainerVolumeTable>('container_volume').delete().where({
      id: containerVolumeId,
    });
    return true;
  }

  static async getDeviceBackups(deviceName: string): Promise<DeviceBackupTable[]> {
    return knex<DeviceBackupTable>('device_backup').select('device_backup.*').where('device_backup.device_name', deviceName);
  }

  static async getDeviceBackup(id: string): Promise<DeviceBackupTable> {
    return knex<DeviceBackupTable>('device_backup').select('device_backup.*').where('device_backup.id', id).first();
  }

  static async setDeviceBackupVolume(deviceId: string, volumeId: string): Promise<boolean> {
    await knex<DeviceTable>('device').update({ backup_volume_id: volumeId }).where('id', deviceId);
    return true;
  }

  static async removeDeviceBackupVolume(deviceId: string): Promise<boolean> {
    await knex<DeviceTable>('device').update({ backup_volume_id: null }).where('id', deviceId);
    return true;
  }

  static async addDeviceBackup(input: Partial<DeviceBackupTable>): Promise<string> {
    await knex<DeviceBackupTable>('device_backup').insert(input);
    return input.id;
  }

  static async deleteDeviceBackup(id: string): Promise<boolean> {
    await knex<DeviceBackupTable>('device_backup').delete().where('id', id);
    return true;
  }
}

export default VolumeModel;