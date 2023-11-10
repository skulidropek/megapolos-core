import { promises as fs } from 'fs';
import AdmZip from 'adm-zip';
import decompress from 'decompress';
import { v4 as uuidv4 } from 'uuid';
import BaseDevice from '../modules/devices/baseDevice';
import { DeviceBackupTable } from '../modules/models/tables';
import VolumeModel from '../modules/models/volume.model';
import Volume from './Volume';
import MegapolosNode from './Node';

class DeviceBackup {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  static async upload(deviceId: string, name: string, filename: string, data: string): Promise<DeviceBackup> {
    const device = await new BaseDevice(deviceId).getData();
    const volume = await new Volume(device.backup_volume_id).getData();
    if (!volume) {
      throw new Error('Volume not found');
    }
    const backupId = uuidv4();
    const backupArchivePath = volume.outer_path + '/' + backupId + '.zip';
    MegapolosNode.currentNode.validatePath(backupArchivePath);
    const backupPath = volume.outer_path + '/' + backupId;
    MegapolosNode.currentNode.validatePath(backupPath);
    await fs.writeFile(backupArchivePath, data, 'base64');
    await fs.mkdir(backupPath);
    await decompress(backupArchivePath, backupPath);
    await fs.unlink(backupArchivePath);
    await VolumeModel.addDeviceBackup({
      id: backupId,
      device_id: deviceId,
      name: name,
    });
    return new DeviceBackup(backupId);
  }

  static async getBackups(device_name: string): Promise<DeviceBackup[]> {
    return (await VolumeModel.getDeviceBackups(device_name)).map((backup) => new DeviceBackup(backup.id));
  }

  getData(): Promise<DeviceBackupTable> {
    return VolumeModel.getDeviceBackup(this.id);
  }

  async getVolume(): Promise<Volume> {
    const backup = await this.getData();
    const device = await new BaseDevice(backup.device_id).getData();
    return new Volume(device.backup_volume_id);
  }

  async download(): Promise<string> {
    const volume = await (await this.getVolume()).getData();
    if (!volume) {
      throw new Error('Volume not found');
    }
    const backupPath = volume.outer_path + '/' + this.id;
    MegapolosNode.currentNode.validatePath(backupPath);
    const zip = new AdmZip();
    zip.addLocalFolder(backupPath);
    const zipData = zip.toBuffer();
    return zipData.toString('base64');
  }
  
  restore() {

  }

  async remove(): Promise<void> {
    const volume = await (await this.getVolume()).getData();
    if (!volume) {
      throw new Error('Volume not found');
    }
    const backupPath = volume.outer_path + '/' + this.id;
    MegapolosNode.currentNode.validatePath(backupPath);
    await fs.rmdir(backupPath, { recursive: true });
    await VolumeModel.deleteDeviceBackup(this.id);
  }
}

export default DeviceBackup;