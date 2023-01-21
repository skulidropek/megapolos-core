import { gql } from 'graphql-request';
import BaseDevice from './baseDevice';

class DatabaseDevice extends BaseDevice {
  async add(containerId: string) {
    return this.client.request(gql`
      mutation($containerId: String) {
        addDatabase(containerId: $containerId)
      }
    `, { containerId });
  }

  async remove(containerId: string) {
    return this.client.request(gql`
      mutation($containerId: String) {
        removeDatabase(containerId: $containerId)
      }
    `, { containerId });
  }

  async backup(containerId: string) {
    return this.client.request(gql`
      mutation($containerId: String) {
        backupDatabase(containerId: $containerId)
      }
    `, { containerId });
  }

  async restore(backupId: string, containerId: string) {
    return this.client.request(gql`
      mutation($backupId: String, $containerId: String) {
        restoreDatabase(backupId: $backupId containerId: $containerId)
      }
    `, { backupId, containerId });
  }
}

export default DatabaseDevice;