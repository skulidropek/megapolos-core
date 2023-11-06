/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { v4 as uuidv4 } from 'uuid';
import { gql } from 'graphql-request';
import BaseDevice from './baseDevice';
import DeviceModel from '../models/device.model';
import { ContainerDeviceDbTable } from '../models/tables';
import VolumeModel from '../models/volume.model';
import { ContainerDeviceInput } from '../../types';

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

  async backup(containerId: string) {
    const backupId = uuidv4();
    await this.request(gql`
      mutation($backupId: String, $containerId: String) {
        backupDatabase(backupId: $backupId containerId: $containerId)
      }
    `, { backupId, containerId });
    await VolumeModel.addDeviceBackup({
      id: backupId,
      device_id: this.id,
      container_id: containerId,
      device_name: (await this.getData()).name,
    });
    return backupId;
  }

  async restore(backupId: string, containerId: string) {
    return this.request(gql`
      mutation($backupId: String, $containerId: String) {
        restoreDatabase(backupId: $backupId containerId: $containerId)
      }
    `, { backupId, containerId });
  }

  async addToContainer(containerId: string, input: ContainerDeviceInput): Promise<void> {
    await super.addToContainer(containerId, input);
    await this.add(containerId);
  }

  async removeFromContainer(containerId: string): Promise<void> {
    this.remove(containerId);
    await super.removeFromContainer(containerId);
  }

  getDbOptionsOfContainer(containerId: string): Promise<ContainerDeviceDbTable> {
    return DeviceModel.getDeviceDbOptionsOfContainer(this.id, containerId);
  }

  setDbOptionsOfContainer(containerId: string, options: ContainerDeviceDbTable): Promise<void> {
    return DeviceModel.setDeviceDbOptionsOfContainer(this.id, containerId, options);
  }
}

export default DatabaseDevice;