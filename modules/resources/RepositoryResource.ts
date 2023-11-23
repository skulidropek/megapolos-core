import RepositoryDevice from '../devices/repositoryDevice';
import BaseResource from './BaseResource';

class RepositoryResource extends BaseResource {
  async getDevice():Promise<RepositoryDevice> {
    const data = await this.getData();
    return new RepositoryDevice(data.device_id);
  }

  async remove():Promise<void> {
  }
}

export default RepositoryResource;
