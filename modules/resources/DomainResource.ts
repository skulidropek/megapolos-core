import DomainDevice from '../devices/domainDevice';
import ResourceModel from '../models/resource.model';
import { ResourceDomainTable } from '../models/tables';
import BaseResource from './BaseResource';

class DomainResource extends BaseResource {
  static async getDomains():Promise<DomainResource[]> {
    return (await ResourceModel.getDomains()).map((item) => new DomainResource(item.id));
  }

  async getDomainData():Promise<ResourceDomainTable> {
    return ResourceModel.getDomainResource(this.id);
  }

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
