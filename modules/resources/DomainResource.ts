import DomainDevice from '../devices/domainDevice';
import BaseResource from './BaseResource';

class DomainResource extends BaseResource {
  async getDevice():Promise<DomainDevice> {
    const data = await this.getData();
    return new DomainDevice(data.device_id);
  }

  async createDomain():Promise<void> {
  }

  async remove():Promise<void> {
  }
}

export default DomainResource;
