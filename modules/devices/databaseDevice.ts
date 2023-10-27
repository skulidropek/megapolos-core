/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { gql } from 'graphql-request';
import BaseDevice from './baseDevice';
import DeviceModel from '../models/device.model';
import { ContainerDeviceDbTable } from '../models/tables';

class DatabaseDevice extends BaseDevice {
  async add(containerId: string) {
    return this.request(gql`
      mutation($containerId: String) {
        addDatabase(containerId: $containerId)
      }
    `, { containerId });
  }

  async remove(containerId: string) {
    return this.request(gql`
      mutation($containerId: String) {
        removeDatabase(containerId: $containerId)
      }
    `, { containerId });
  }

  async backup(backupId:string, containerId: string) {
    return this.request(gql`
      mutation($backupId: String, $containerId: String) {
        backupDatabase(backupId: $backupId containerId: $containerId)
      }
    `, { backupId, containerId });
  }

  async restore(backupId: string, containerId: string) {
    return this.request(gql`
      mutation($backupId: String, $containerId: String) {
        restoreDatabase(backupId: $backupId containerId: $containerId)
      }
    `, { backupId, containerId });
  }

  getDbOptionsOfContainer(containerId: string): Promise<ContainerDeviceDbTable> {
    return DeviceModel.getDeviceDbOptionsOfContainer(this.id, containerId);
  }

  setDbOptionsOfContainer(containerId: string, options: ContainerDeviceDbTable): Promise<void> {
    return DeviceModel.setDeviceDbOptionsOfContainer(this.id, containerId, options);
  }
}

export default DatabaseDevice;