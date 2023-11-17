import BuilderDevice from '../devices/builderDevice';
import BaseResource from './BaseResource';

class DockerImageResource extends BaseResource {
  async getDevice():Promise<BuilderDevice> {
    const data = await this.getData();
    return new BuilderDevice(data.device_id);
  }

  async remove():Promise<void> {
  }
}

export default DockerImageResource;
