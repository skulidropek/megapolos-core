import coreRqlite from '../../coreRqlite';
import { AppInstanceTable, AppTable, ContainerDeviceEnvOptionTable, ContainerDeviceOptionTable, ContainerTable, DeviceTable, DriverTable, ImageTable } from './tables';

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

  static async getDeviceContainer(deviceId: string):Promise<(ContainerTable & { device_type_id: string; device_id: string })> {
    return (await coreRqlite.query([[`
        SELECT c.*, d.id AS device_id, d.device_type_id FROM device d
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

  static async getDevices():Promise<DeviceModel[]> {
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

  static async addOptionToContainer(input: ContainerDeviceOptionTable) {
    await coreRqlite.execute([[`
          INSERT INTO container_device_option (id, container_id, device_id, device_option_name, container_option_value)
          VALUES (?, ?, ?, ?, ?)
        `, input.id, input.container_id, input.device_id, input.device_option_name, input.container_option_value]]);
  }

  static async getEnvOfContainer(containerId: string):Promise<ContainerDeviceEnvOptionTable[]> {
    return (await coreRqlite.query([[`
    SELECT * FROM container_device_env_option WHERE container_id = ?
  `, containerId]])).toArray();
  }

  static async getDeviceOptionsOfContainer(deviceId: string, containerId: string):Promise<ContainerDeviceOptionTable[]> {
    return (await coreRqlite.query([[`
    SELECT * FROM container_device_option WHERE device_id = ? AND container_id = ?
  `, deviceId, containerId]])).toArray();
  }


  static async getDevicesOfContainer(containerId: string):Promise<(ContainerTable & { device_type_id: string; device_id: string })[]> {
    return (await coreRqlite.query([[`
    SELECT c.*, d.id AS device_id, d.device_type_id AS device_type_id FROM device d
    JOIN container_device cd ON d.id = cd.device_id
    LEFT JOIN driver dr ON d.driver_id = dr.id
    LEFT JOIN app_instance ai ON dr.app_id = ai.app_id
    LEFT JOIN container c ON ai.id = c.app_instance_id
    WHERE cd.container_id = ?
  `, containerId]])).toArray();
  }

  static async getDeviceFromContainer(containerId: string):Promise<{ driver_id: string, device_id: string, device_type_id: string }> {
    return (await coreRqlite.query([[`
  SELECT dr.id AS driver_id, d.id AS device_id, d.device_type_id AS device_type_id FROM device d
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
}

export default DeviceModel;