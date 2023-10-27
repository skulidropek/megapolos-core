/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { gql } from 'graphql-request';
import BaseDevice from './baseDevice';
import DeviceModel from '../models/device.model';
import { ContainerDeviceCertificateTable } from '../models/tables';

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

  getCertificateOptionsOfContainer(containerId: string): Promise<ContainerDeviceCertificateTable> {
    return DeviceModel.getDeviceCertificateOptionsOfContainer(this.id, containerId);
  }

  setCertificateOptionsOfContainer(containerId: string, options: ContainerDeviceCertificateTable): Promise<void> {
    return DeviceModel.setDeviceCertificateOptionsOfContainer(this.id, containerId, options);
  }
}

export default CertificateDevice;