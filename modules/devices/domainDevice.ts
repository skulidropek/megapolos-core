import { gql } from 'graphql-request';
import BaseDevice from './baseDevice';

class DomainDevice extends BaseDevice {
  async add(container_id: string, port: number) {
    return this.client.request(gql`
      mutation($input: DomainInput) {
        addDomain(input: $input)
      }
    `, { input: { container_id, port: parseInt(port as any) } });
  }

  async remove(containerId: string) {
    return this.client.request(gql`
      mutation($containerId: String) {
        removeDomain(container_id: $containerId)
      }
    `, { containerId });
  }
}

export default DomainDevice;