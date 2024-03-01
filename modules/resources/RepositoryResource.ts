import RepositoryDevice from '../devices/repositoryDevice';
import ResourceModel from '../models/resource.model';
import { ResourceRepositoryTable } from '../models/tables';
import BaseResource from './BaseResource';

class RepositoryResource extends BaseResource {
  static async getRepositories():Promise<RepositoryResource[]> {
    const data = await ResourceModel.getRepositories();
    return data.map((item) => new RepositoryResource(item.id));
  }

  async getDevice():Promise<RepositoryDevice> {
    const data = await this.getData();
    return new RepositoryDevice(data.device_id);
  }

  async getRepositoryData():Promise<ResourceRepositoryTable> {
    return ResourceModel.getRepositoryResource(this.id);
  }

  async remove():Promise<void> {
  }
}

export default RepositoryResource;
