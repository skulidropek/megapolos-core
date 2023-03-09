import { gql } from 'graphql-request';
import BaseDevice from './baseDevice';

class CertificateDevice extends BaseDevice {
  async get(container_id: string) {
    return this.client.request(gql`
      query($containerId: String) {
        getCertificate(container_id: $containerId)
      }
    `, { container_id });
  }

  async add(container_id: string) {
    return this.client.request(gql`
      mutation($containerId: String) {
        addCertificate(container_id: $containerId)
      }
    `, { input: { container_id } });
  }

  async remove(containerId: string) {
    return this.client.request(gql`
      mutation($containerId: String) {
        removeCertificate(container_id: $containerId)
      }
    `, { containerId });
  }
}

export default CertificateDevice;