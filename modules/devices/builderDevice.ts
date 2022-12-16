import { gql } from 'graphql-request';
import BaseDevice from './baseDevice';

class BuilderDevice extends BaseDevice {
  async build(containerId: string, image:string, path:string) {
    return this.client.request(gql`
      mutation($containerId: String, $image: String, $path: String) {
        build($container_id: String, image: $image, path: $path)
      }
    `, { image, path, containerId });
  }
  async buildLocal(containerId: string, image: string) {
    return this.client.request(gql`
      mutation($containerId: String, $image: String) {
        buildLocal (container_id: $containerId, image: $image)
      }
    `, { containerId, image });
  }
}

export default BuilderDevice;