import DeviceModel from '../models/device.model';
import BaseResource from '../resources/BaseResource';
import CertificateResource from '../resources/CertificateResource';
import DbResource from '../resources/DbResource';
import DockerImageResource from '../resources/DockerImageResource';
import DomainResource from '../resources/DomainResource';
import RepositoryResource from '../resources/RepositoryResource';
import BaseDevice from './baseDevice';

class BaseResourceWithType extends BaseDevice {

  static async getResourceWithType(id: string): Promise<BaseResource> {
    const data = await DeviceModel.getDevice(id);
    if (data.device_type_id === 'db') {
      return new DbResource(id);
    } 
    if (data.device_type_id === 'domain') {
      return new DomainResource(id);
    } 
    if (data.device_type_id === 'certificate') {
      return new CertificateResource(id);
    } 
    if (data.device_type_id === 'repository') {
      return new RepositoryResource(id);
    } 
    if (data.device_type_id === 'docker_image') {
      return new DockerImageResource(id);
    }
    return new BaseResource(id);
  }
}

export default BaseResourceWithType;