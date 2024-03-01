import BuilderDevice from '../devices/builderDevice';
import ResourceModel from '../models/resource.model';
import { ResourceDockerImageTable } from '../models/tables';
import BaseResource from './BaseResource';

class DockerImageResource extends BaseResource {
  static async getDockerImages():Promise<DockerImageResource[]> {
    const data = await ResourceModel.getDockerImages();
    return data.map((item) => new DockerImageResource(item.id));
  }
  
  async getDevice():Promise<BuilderDevice> {
    const data = await this.getData();
    return new BuilderDevice(data.device_id);
  }

  async getDockerImageData():Promise<ResourceDockerImageTable> {
    return ResourceModel.getDockerImageResource(this.id);
  }

  async remove():Promise<void> {
  }
}

export default DockerImageResource;
