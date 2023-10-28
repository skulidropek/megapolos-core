import { DeviceBackupTable } from '../modules/models/tables';
import VolumeModel from '../modules/models/volume.model';

class DeviceBackup {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  static async getBackups(device_name: string): Promise<DeviceBackup[]> {
    return (await VolumeModel.getDeviceBackups(device_name)).map((backup) => new DeviceBackup(backup.id));
  }

  getData(): Promise<DeviceBackupTable> {
    return VolumeModel.getDeviceBackup(this.id);
  }

  download() {

  }

  upload() {

  }
  
  restore() {

  }

  remove() {
    
  }
}

export default DeviceBackup;