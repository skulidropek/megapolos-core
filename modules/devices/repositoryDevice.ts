/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { gql } from 'graphql-request';
import BaseDevice from './baseDevice';
import DeviceModel from '../models/device.model';
import { ContainerDeviceRepositoryTable } from '../models/tables';

class RepositoryDevice extends BaseDevice {
  async cloneContainer(containerId: string): Promise<{ path: string }> {
    return (await this.request(gql`
      mutation($containerId: String) {
        cloneContainer(container_id: $containerId) {
          path
        }
      }
    `, { containerId })).cloneContainer;
  }

  getRepositoryOptionsOfContainer(containerId: string): Promise<ContainerDeviceRepositoryTable> {
    return DeviceModel.getDeviceRepositoryOptionsOfContainer(this.id, containerId);
  }

  setRepositoryOptionsOfContainer(containerId: string, options: ContainerDeviceRepositoryTable): Promise<void> {
    return DeviceModel.setDeviceRepositoryOptionsOfContainer(this.id, containerId, options);
  }
}

export default RepositoryDevice;