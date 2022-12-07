import { gql } from 'graphql-request';
import BaseDevice from './baseDevice';

class BuilderDevice extends BaseDevice {
  async build(image:string, path:string) {
    return this.client.request(gql`
      mutation($image: String, $path: String) {
        build(image: $image, path: $path)
      }
    `, { image, path });
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