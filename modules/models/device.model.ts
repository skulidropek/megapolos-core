/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import coreRqlite from '../../coreRqlite';
import { ContainerDeviceCertificateTable, ContainerDeviceDbTable, ContainerDeviceDomainTable, ContainerDeviceEnvOptionTable, ContainerDeviceAuxOptionTable, ContainerTable, DeviceOptionTable, DeviceTable, DriverTable, ContainerDeviceRepositoryTable } from './tables';
import { v4 as uuidv4 } from 'uuid';

class DeviceModel {
  static async createDevice(input: Partial<DeviceTable>) {
    await coreRqlite.execute([[`
      INSERT INTO device (id, name, device_type_id, node_id, driver_id) VALUES (?, ?, ?, ?, ?)
    `, input.id, input.name, input.device_type_id, input.node_id, input.driver_id]]);
  }

  static async createDriver(input: DriverTable) {
    await coreRqlite.execute([[`
    INSERT INTO driver (id, name, app_id) VALUES (?, ?, ?)
  `, input.id, input.name, input.app_id]]);
  }

  static async getDeviceDriverContainer(deviceId: string):Promise<(ContainerTable)> {
    return (await coreRqlite.query([[`
        SELECT c.* FROM device d
        LEFT JOIN driver dr ON d.driver_id = dr.id
        LEFT JOIN app_instance ai ON dr.app_id = ai.app_id
        LEFT JOIN container c ON ai.id = c.app_instance_id
        WHERE d.id = ?
        LIMIT 1
      `, deviceId]])).toArray()[0];
  }

  static async getDevice(deviceId: string):Promise<DeviceTable> {
    return (await coreRqlite.query([[`
      SELECT * FROM device WHERE id = ?
    `, deviceId]])).toArray()[0];
  }

  static async getDevices():Promise<DeviceTable[]> {
    return (await coreRqlite.query('SELECT * FROM device')).toArray();
  }

  static async getDriver(driverId: string):Promise<DriverTable> {
    return (await coreRqlite.query([[`
      SELECT * FROM driver WHERE id = ?
    `, driverId]])).toArray()[0];
  }

  static async addEnvToContainer(input: ContainerDeviceEnvOptionTable) {
    await coreRqlite.execute([[`
          INSERT INTO container_device_env_option (id, container_id, device_id, device_option_name, container_env_name)
          VALUES (?, ?, ?, ?, ?)
        `, input.id, input.container_id, input.device_id, input.device_option_name, input.container_env_name]]);
  }

  static async addAuxOptionToContainer(input: ContainerDeviceAuxOptionTable) {
    await coreRqlite.execute([[`
          INSERT INTO container_device_option (id, container_id, device_id, device_option_name, container_option_value)
          VALUES (?, ?, ?, ?, ?)
        `, input.id, input.container_id, input.device_id, input.device_option_name, input.container_option_value]]);
  }

  static async getDeviceOptions(deviceId: string):Promise<DeviceOptionTable[]> {
    return (await coreRqlite.query([[`
      SELECT * FROM device_option WHERE device_id = ?
    `, deviceId]])).toArray();
  }

  static async setDeviceOptions(deviceId: string, options: { key: string, value: string }[]) {
    await coreRqlite.execute([[`
      DELETE FROM device_option WHERE device_id = ?
    `, deviceId]]);
    await coreRqlite.execute(options.map(option => [`
        INSERT INTO device_option (id, device_id, device_option_name, device_option_value) VALUES (?, ?, ?, ?)
      `, uuidv4(), deviceId, option.key, option.value]));
  }

  static async setDeviceVirtual(deviceId: string, isVirtual: number, virtualDeviceContainerId: string) {
    await coreRqlite.execute([[`
      UPDATE device SET is_virtual = ?, virtual_device_container_id = ? WHERE id = ?
    `, isVirtual.toString(), virtualDeviceContainerId, deviceId]]);
  }

  static async getEnvOfContainer(containerId: string):Promise<ContainerDeviceEnvOptionTable[]> {
    return (await coreRqlite.query([[`
    SELECT * FROM container_device_env_option WHERE container_id = ?
  `, containerId]])).toArray();
  }

  static async getDeviceAuxOptionsOfContainer(deviceId: string, containerId: string):Promise<ContainerDeviceAuxOptionTable[]> {
    return (await coreRqlite.query([[`
    SELECT * FROM container_device_aux_option WHERE device_id = ? AND container_id = ?
  `, deviceId, containerId]])).toArray();
  }

  static async setDeviceAuxOptionsOfContainer(deviceId: string, containerId: string, options: { key: string, value: string }[]) {
    await coreRqlite.execute([[`
      DELETE FROM container_device_aux_option WHERE device_id = ? AND container_id = ?
    `, deviceId, containerId]]);
    await coreRqlite.execute(options.map(option => [`
        INSERT INTO container_device_aux_option (id, container_id, device_id, device_option_name, container_option_value) VALUES (?, ?, ?, ?, ?)
      `, uuidv4(), containerId, deviceId, option.key, option.value]));
  }

  static async setDeviceEnvOptionsOfContainer(deviceId: string, containerId: string, options: { key: string, value: string }[]) {
    await coreRqlite.execute([[`
      DELETE FROM container_device_env_option WHERE device_id = ? AND container_id = ?
    `, deviceId, containerId]]);
    await coreRqlite.execute(options.map(option => [`
        INSERT INTO container_device_env_option (id, container_id, device_id, device_option_name, container_env_name) VALUES (?, ?, ?, ?, ?)
      `, uuidv4(), containerId, deviceId, option.key, option.value]));
  }

  static async getDeviceDomainOptionsOfContainer(deviceId: string, containerId: string):Promise<ContainerDeviceDomainTable> {
    const result = (await coreRqlite.query([[`
    SELECT * FROM container_device_domain WHERE device_id = ? AND container_id = ?
  `, deviceId, containerId]])).toArray()[0];
    if (result) {
      if (!result.is_ssl) {
        result.is_ssl = 0;
      }
    }
    return result;
  }

  static async setDeviceDomainOptionsOfContainer(deviceId: string, containerId: string, options: ContainerDeviceDomainTable) {
    if (await DeviceModel.getDeviceDomainOptionsOfContainer(deviceId, containerId)) {
      await coreRqlite.execute([[`
      UPDATE container_device_domain SET domain = ?, is_ssl = ? WHERE device_id = ? AND container_id = ?
    `, options.domain, options.is_ssl?.toString() || '', deviceId, containerId]]);
    } else {
      await coreRqlite.execute([[`
      INSERT INTO container_device_domain (id, container_id, device_id, domain, is_ssl) VALUES (?, ?, ?, ?, ?)
    `, uuidv4(), containerId, deviceId, options.domain, options.is_ssl?.toString() || '']]);
    }
  }

  static async removeDeviceDomainOptionsOfContainer(deviceId: string, containerId: string) {
    await coreRqlite.execute([[`
      DELETE FROM container_device_domain WHERE device_id = ? AND container_id = ?
    `, deviceId, containerId]]);
  }

  static async getDeviceCertificateOptionsOfContainer(deviceId: string, containerId: string):Promise<ContainerDeviceCertificateTable> {
    return (await coreRqlite.query([[`
    SELECT * FROM container_device_certificate WHERE device_id = ? AND container_id = ?
  `, deviceId, containerId]])).toArray()[0];
  }

  static async setDeviceCertificateOptionsOfContainer(deviceId: string, containerId: string, options: ContainerDeviceCertificateTable) {
    if (await DeviceModel.getDeviceCertificateOptionsOfContainer(deviceId, containerId)) {
      await coreRqlite.execute([[`
      UPDATE container_device_certificate SET private_key_path = ?, public_key_path = ? WHERE device_id = ? AND container_id = ?
    `, options.private_key_path, options.public_key_path, deviceId, containerId]]);
    } else {
      await coreRqlite.execute([[`
      INSERT INTO container_device_certificate (id, container_id, device_id, private_key_path, public_key_path) VALUES (?, ?, ?, ?, ?)
    `, uuidv4(), containerId, deviceId, options.private_key_path, options.public_key_path]]);
    }
  }

  static async removeDeviceCertificateOptionsOfContainer(deviceId: string, containerId: string) {
    await coreRqlite.execute([[`
      DELETE FROM container_device_certificate WHERE device_id = ? AND container_id = ?
    `, deviceId, containerId]]);
  }

  static async getDeviceDbOptionsOfContainer(deviceId: string, containerId: string):Promise<ContainerDeviceDbTable> {
    return (await coreRqlite.query([[`
    SELECT * FROM container_device_db WHERE device_id = ? AND container_id = ?
  `, deviceId, containerId]])).toArray()[0];
  }

  static async setDeviceDbOptionsOfContainer(deviceId: string, containerId: string, options: ContainerDeviceDbTable) {
    if (await DeviceModel.getDeviceDbOptionsOfContainer(deviceId, containerId)) {
      await coreRqlite.execute([[`
      UPDATE container_device_db SET db_host = ?, db_name = ?, db_user = ?, db_password = ?, db_protocol = ? WHERE device_id = ? AND container_id = ?
    `, options.db_host, options.db_name, options.db_user, options.db_password, options.db_protocol, deviceId, containerId]]);
    } else {
      await coreRqlite.execute([[`
      INSERT INTO container_device_db (id, container_id, device_id, db_host, db_name, db_user, db_password, db_protocol) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, uuidv4(), containerId, deviceId, options.db_host, options.db_name, options.db_user, options.db_password, options.db_protocol]]);
    }
  }

  static async removeDeviceDbOptionsOfContainer(deviceId: string, containerId: string) {
    return coreRqlite.execute([[`
      DELETE FROM container_device_db WHERE device_id = ? AND container_id = ?
    `, deviceId, containerId]]);
  }

  static async getDeviceRepositoryOptionsOfContainer(deviceId: string, containerId: string):Promise<ContainerDeviceRepositoryTable> {
    return (await coreRqlite.query([[`
    SELECT * FROM container_device_repository WHERE device_id = ? AND container_id = ?
  `, deviceId, containerId]])).toArray()[0];
  }

  static async setDeviceRepositoryOptionsOfContainer(deviceId: string, containerId: string, options: ContainerDeviceRepositoryTable) {
    if (await DeviceModel.getDeviceRepositoryOptionsOfContainer(deviceId, containerId)) {
      await coreRqlite.execute([[`
        UPDATE container_device_repository SET repository WHERE device_id = ? AND container_id = ?
      `, options.repository, deviceId, containerId]]);
    } else {
      await coreRqlite.execute([[`
        INSERT INTO container_device_repository (id, container_id, device_id, repository) VALUES (?, ?, ?, ?)
      `, uuidv4(), containerId, deviceId, options.repository]]);
    }
  }

  static async removeDeviceRepositoryOptionsOfContainer(deviceId: string, containerId: string) {
    return coreRqlite.execute([[`
      DELETE FROM container_device_repository WHERE device_id = ? AND container_id = ?
    `, deviceId, containerId]]);
  }

  static async getDeviceEnvsOfContainer(deviceId: string, containerId: string):Promise<ContainerDeviceEnvOptionTable[]> {
    return (await coreRqlite.query([[`
    SELECT * FROM container_device_env_option WHERE device_id = ? AND container_id = ?
  `, deviceId, containerId]])).toArray();
  }


  static async getDevicesOfContainer(containerId: string):Promise<(DeviceTable)[]> {
    return (await coreRqlite.query([[`
    SELECT d.*
    FROM device d
    LEFT JOIN container_device cd ON d.id = cd.device_id
    LEFT JOIN driver dr ON d.driver_id = dr.id
    LEFT JOIN app_instance ai ON dr.app_id = ai.app_id
    LEFT JOIN container c ON ai.id = c.app_instance_id
    WHERE cd.container_id = ?
  `, containerId]])).toArray();
  }

  static async getDeviceFromContainer(containerId: string):Promise<DeviceTable> {
    return (await coreRqlite.query([[`
  SELECT d.* FROM device d
  LEFT JOIN driver dr ON d.driver_id = dr.id
  LEFT JOIN app_instance ai ON dr.app_id = ai.app_id
  LEFT JOIN container c ON ai.id = c.app_instance_id
  WHERE c.id = ?
`, containerId]])).toArray()[0];
  }

  static async addDeviceToContainer(input: { containerDeviceId: string, containerId: string, deviceId: string }) {
    await coreRqlite.execute([[`
        INSERT INTO container_device (id, container_id, device_id)
        VALUES (?, ?, ?)
      `, input.containerDeviceId, input.containerId, input.deviceId]]);
  }  

  static async removeDeviceFromContainer(input: { containerId: string, deviceId: string }) {
    await coreRqlite.execute([['DELETE FROM container_device WHERE container_id = ? AND device_id = ?', 
      input.containerId, input.deviceId]]);
    const device = await DeviceModel.getDevice(input.deviceId);
    if (device.device_type_id === 'domain') {
      await DeviceModel.removeDeviceDomainOptionsOfContainer(input.deviceId, input.containerId);
    }
    if (device.device_type_id === 'db') {
      await DeviceModel.removeDeviceDbOptionsOfContainer(input.deviceId, input.containerId);
    }
    if (device.device_type_id === 'certificate') {
      await DeviceModel.removeDeviceCertificateOptionsOfContainer(input.deviceId, input.containerId);
    }
    await coreRqlite.execute([['DELETE FROM container_device_aux_option WHERE container_id = ? AND device_id = ?',
      input.containerId, input.deviceId]]);
    await coreRqlite.execute([['DELETE FROM container_device_env_option WHERE container_id = ? AND device_id = ?',
      input.containerId, input.deviceId]]);
  }

  static async removeOptionsOfDeviceFromContainer(input: { containerId: string, deviceId: string }) {
    await coreRqlite.execute([['DELETE FROM container_device_option WHERE container_id = ? AND device_id = ?',
      input.containerId, input.deviceId]]);
    await coreRqlite.execute([['DELETE FROM container_device_env_option WHERE container_id = ? AND device_id = ?',
      input.containerId, input.deviceId]]);
  }

  static async removeDevicesFromContainer(containerId: string) {
    await coreRqlite.execute([['DELETE FROM container_device WHERE container_id = ?', containerId]]);
  }

  static async removeEnvsFromContainer(containerId: string) {
    await coreRqlite.execute([['DELETE FROM container_device_env_option WHERE container_id = ?', containerId]]);
  }

  static async removeOptionsFromContainer(containerId: string) {
    await coreRqlite.execute([['DELETE FROM container_device_option WHERE container_id = ?', containerId]]);
  }

  static async removeDevice(deviceId: string) {
    await coreRqlite.execute([[`
      DELETE FROM device WHERE id = ?
    `, deviceId]]);
  }

  static async removeDriver(driverId: string) {
    coreRqlite.execute([[`
      DELETE FROM driver WHERE id = ?
    `, driverId]]);
  }

  static async updateDeviceType(deviceId: string, deviceTypeId: string) {
    await coreRqlite.execute([[`
      UPDATE device SET device_type_id = ? WHERE id = ?
    `, deviceTypeId, deviceId]]);
  }
}

export default DeviceModel;