/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { gql } from 'graphql-request';
import BaseDevice from './baseDevice';
import DeviceModel from '../models/device.model';
import { ContainerDeviceCertificateTable } from '../models/tables';
import { ContainerDeviceInput } from '../../types';
import Container from '../../classes/Container';
import DomainDevice from './domainDevice';

class CertificateDevice extends BaseDevice {
  async get(container_id: string) {
    return this.request(gql`
      query($containerId: String) {
        getCertificate(container_id: $containerId)
      }
    `, { container_id });
  }

  async add(containerId: string) {
    return this.request(gql`
      mutation($containerId: String) {
        addCertificate(container_id: $containerId)
      }
    `, { containerId });
  }

  async remove(containerId: string) {
    return this.request(gql`
      mutation($containerId: String) {
        removeCertificate(container_id: $containerId)
      }
    `, { containerId });
  }

  async addToContainer(containerId: string, input: ContainerDeviceInput): Promise<void> {
    await super.addToContainer(containerId, input);
    const container = new Container(containerId);
    const domainDevice = await container.getDeviceOfType('domain');
    if (!domainDevice) {
      throw new Error('Domain device not found');
    }
    await this.add(containerId);
    await (domainDevice as DomainDevice).add(containerId);
  }

  async removeFromContainer(containerId: string): Promise<void> {
    try {
      await this.remove(containerId);
    } catch (e) {
      this.remove(containerId);
    }
    await super.removeFromContainer(containerId);
  }

  getCertificateOptionsOfContainer(containerId: string): Promise<ContainerDeviceCertificateTable> {
    return DeviceModel.getDeviceCertificateOptionsOfContainer(this.id, containerId);
  }

  setCertificateOptionsOfContainer(containerId: string, options: ContainerDeviceCertificateTable): Promise<void> {
    return DeviceModel.setDeviceCertificateOptionsOfContainer(this.id, containerId, options);
  }
}

export default CertificateDevice;