import { gql } from 'graphql-request';
import BaseDevice from './baseDevice';

class RepositoryDevice extends BaseDevice {
  async cloneContainer(containerId: string): Promise<{ path: string }> {
    return (await this.client.request(gql`
      mutation($containerId: String) {
        cloneContainer(container_id: $containerId) {
          path
        }
      }
    `, { containerId })).cloneContainer;
  }
}

export default RepositoryDevice;