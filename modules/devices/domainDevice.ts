/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { gql } from 'graphql-request';
import BaseDevice from './baseDevice';
import DeviceModel from '../models/device.model';
import { ContainerDeviceDomainTable } from '../models/tables';
import Container from '../../classes/Container';

class DomainDevice extends BaseDevice {
  async add(container_id: string) {
    const container = new Container(container_id);
    const data = await container.getData();
    return this.request(gql`
      mutation($input: DomainInput) {
        addDomain(input: $input)
      }
    `, { input: { container_id, port: parseInt(data.outer_port as any) } });
  }

  async remove(containerId: string) {
    return this.request(gql`
      mutation($containerId: String) {
        removeDomain(container_id: $containerId)
      }
    `, { containerId });
  }

  async removeFromContainer(containerId: string): Promise<void> {
    this.remove(containerId);
    await super.removeFromContainer(containerId);
  }

  getDomainOptionsOfContainer(containerId: string): Promise<ContainerDeviceDomainTable> {
    return DeviceModel.getDeviceDomainOptionsOfContainer(this.id, containerId);
  }

  setDomainOptionsOfContainer(containerId: string, options: ContainerDeviceDomainTable): Promise<void> {
    return DeviceModel.setDeviceDomainOptionsOfContainer(this.id, containerId, options);
  }
}

export default DomainDevice;