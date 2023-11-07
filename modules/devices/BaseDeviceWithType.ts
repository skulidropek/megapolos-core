import DeviceModel from '../models/device.model';
import BaseDevice from './baseDevice';
import BuilderDevice from './builderDevice';
import CertificateDevice from './certificateDevice';
import DatabaseDevice from './databaseDevice';
import DomainDevice from './domainDevice';
import RepositoryDevice from './repositoryDevice';

class BaseDeviceWithType extends BaseDevice {

  static async getDeviceWithType(id: string): Promise<BaseDevice> {
    const data = await DeviceModel.getDevice(id);
    if (data.device_type_id === 'db') {
      return new DatabaseDevice(id);
    } 
    if (data.device_type_id === 'domain') {
      return new DomainDevice(id);
    } 
    if (data.device_type_id === 'certificate') {
      return new CertificateDevice(id);
    } 
    if (data.device_type_id === 'repository') {
      return new RepositoryDevice(id);
    } 
    if (data.device_type_id === 'builder') {
      return new BuilderDevice(id);
    }
    return new BaseDevice(id);
  }
}

export default BaseDeviceWithType;