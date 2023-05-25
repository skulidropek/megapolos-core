/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

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