/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { knex } from '../../coreRqlite';
import { ContainerDeviceCertificateTable, ContainerDeviceDbTable, ContainerDeviceDomainTable, ContainerDeviceEnvOptionTable, ContainerDeviceAuxOptionTable, ContainerTable, DeviceOptionTable, DeviceTable, DriverTable, ContainerDeviceRepositoryTable, ContainerDeviceTable } from './tables';
import { v4 as uuidv4 } from 'uuid';

class DeviceModel {
  static async createDevice(input: Partial<DeviceTable>) {
    await knex<DeviceTable>('device').insert(input);
  }

  static async createDriver(input: DriverTable) {
    await knex<DriverTable>('driver').insert(input);
  }

  static async getDeviceDriverContainer(deviceId: string):Promise<(ContainerTable)> {
    return knex<ContainerTable>('container').select('container.*')
      .from('device')
      .leftJoin('driver', 'device.driver_id', 'driver.id')
      .leftJoin('app_instance', 'driver.app_id', 'app_instance.app_id')
      .leftJoin('container', 'app_instance.id', 'container.app_instance_id')
      .where('device.id', deviceId)
      .limit(1)
      .first();
  }

  static async getDevice(deviceId: string):Promise<DeviceTable> {
    return knex<DeviceTable>('device').select('device.*').where('device.id', deviceId).first();
  }

  static async getDevices():Promise<DeviceTable[]> {
    return knex<DeviceTable>('device').select('device.*');
  }

  static async getDriver(driverId: string):Promise<DriverTable> {
    return knex<DriverTable>('driver').select('driver.*').where('driver.id', driverId).first();
  }

  static async addEnvToContainer(input: ContainerDeviceEnvOptionTable) {
    await knex<ContainerDeviceEnvOptionTable>('container_device_env_option').insert(input);
  }

  static async addAuxOptionToContainer(input: ContainerDeviceAuxOptionTable) {
    await knex<ContainerDeviceAuxOptionTable>('container_device_aux_option').insert(input);
  }

  static async getDeviceOptions(deviceId: string):Promise<DeviceOptionTable[]> {
    return knex.select('device_option.*').from('device_option').where('device_option.device_id', deviceId);
  }

  static async setDeviceOptions(deviceId: string, options: { key: string, value: string }[]) {
    await knex<DeviceOptionTable>('device_option').delete().where('device_id', deviceId);
    await knex<DeviceOptionTable>('device_option').insert(options.map(option => ({
      id: uuidv4(),
      device_id: deviceId,
      device_option_name: option.key,
      device_option_value: option.value,
    })));
  }

  static async setDeviceVirtual(deviceId: string, isVirtual: number, virtualDeviceContainerId: string) {
    await knex<DeviceTable>('device').update({ is_virtual: isVirtual, 
      virtual_device_container_id: virtualDeviceContainerId,
    }).where('id', deviceId);
  }

  static async getEnvOfContainer(containerId: string):Promise<ContainerDeviceEnvOptionTable[]> {
    return knex<ContainerDeviceEnvOptionTable>('container_device_env_option')
      .select('container_device_env_option.*')
      .where('container_device_env_option.container_id', containerId);
  }

  static async getDeviceAuxOptionsOfContainer(deviceId: string, containerId: string):Promise<ContainerDeviceAuxOptionTable[]> {
    return knex<ContainerDeviceAuxOptionTable>('container_device_aux_option')
      .select('container_device_aux_option.*')
      .where({
        container_id: containerId,
        device_id: deviceId,
      });
  }

  static async setDeviceAuxOptionsOfContainer(deviceId: string, containerId: string, options: { key: string, value: string }[]) {
    await knex<ContainerDeviceAuxOptionTable>('container_device_aux_option').delete().where({
      container_id: containerId,
      device_id: deviceId,
    });
    await knex<ContainerDeviceAuxOptionTable>('container_device_aux_option').insert(options.map(option => ({
      id: uuidv4(),
      container_id: containerId,
      device_id: deviceId,
      device_option_name: option.key,
      container_option_value: option.value,
    })));
  }

  static async setDeviceEnvOptionsOfContainer(deviceId: string, containerId: string, options: { key: string, value: string }[]) {
    await knex<ContainerDeviceEnvOptionTable>('container_device_env_option').delete().where({
      container_id: containerId,
      device_id: deviceId,
    });
    await knex<ContainerDeviceEnvOptionTable>('container_device_env_option').insert(options.map(option => ({
      id: uuidv4(),
      container_id: containerId,
      device_id: deviceId,
      device_option_name: option.key,
      container_env_name: option.value,
    })));
  }

  static async getDeviceDomainOptionsOfContainer(deviceId: string, containerId: string):Promise<ContainerDeviceDomainTable> {
    const result = await knex
      .select<ContainerDeviceDomainTable>('container_device_domain.*')
      .where({
        container_id: containerId,
        device_id: deviceId,
      }).first();
    if (result) {
      if (!result.is_ssl) {
        result.is_ssl = 0;
      }
    }
    return result;
  }

  static async setDeviceDomainOptionsOfContainer(deviceId: string, containerId: string, options: ContainerDeviceDomainTable) {
    if (await DeviceModel.getDeviceDomainOptionsOfContainer(deviceId, containerId)) {
      await knex <ContainerDeviceDomainTable>('container_device_domain').update({
        domain: options.domain,
        is_ssl: options.is_ssl || 0,
      }).where({
        device_id: deviceId,
        container_id: containerId,
      });
    } else {
      await knex<ContainerDeviceDomainTable>('container_device_domain').insert({
        id: uuidv4(),
        container_id: containerId,
        device_id: deviceId,
        domain: options.domain,
        is_ssl: options.is_ssl || 0,
      });
    }
  }

  static async removeDeviceDomainOptionsOfContainer(deviceId: string, containerId: string) {
    await knex<ContainerDeviceDomainTable>('container_device_domain').delete().where({
      device_id: deviceId,
      container_id: containerId,
    });
  }

  static async getDeviceCertificateOptionsOfContainer(deviceId: string, containerId: string):Promise<ContainerDeviceCertificateTable> {
    return knex<ContainerDeviceCertificateTable>('container_device_certificate')
      .select('container_device_certificate.*')
      .where({
        container_id: containerId,
        device_id: deviceId,
      }).first();
  }

  static async setDeviceCertificateOptionsOfContainer(deviceId: string, containerId: string, options: ContainerDeviceCertificateTable) {
    if (await DeviceModel.getDeviceCertificateOptionsOfContainer(deviceId, containerId)) {
      await knex<ContainerDeviceCertificateTable>('container_device_certificate').update({
        private_key_path: options.private_key_path,
        public_key_path: options.public_key_path,
      }).where({
        device_id: deviceId,
        container_id: containerId,
      });
    } else {
      await knex<ContainerDeviceCertificateTable>('container_device_certificate').insert({
        id: uuidv4(),
        container_id: containerId,
        device_id: deviceId,
        private_key_path: options.private_key_path,
        public_key_path: options.public_key_path,
      });
    }
  }

  static async removeDeviceCertificateOptionsOfContainer(deviceId: string, containerId: string) {
    await knex<ContainerDeviceCertificateTable>('container_device_certificate').delete().where({
      device_id: deviceId,
      container_id: containerId,
    });
  }

  static async getDeviceDbOptionsOfContainer(deviceId: string, containerId: string):Promise<ContainerDeviceDbTable> {
    return knex<ContainerDeviceDbTable>('container_device_db')
      .select('container_device_db.*')
      .where({
        container_id: containerId,
        device_id: deviceId,
      }).first();
  }

  static async setDeviceDbOptionsOfContainer(deviceId: string, containerId: string, options: ContainerDeviceDbTable) {
    if (await DeviceModel.getDeviceDbOptionsOfContainer(deviceId, containerId)) {
      await knex<ContainerDeviceDbTable>('container_device_db').update(options).where({
        device_id: deviceId,
        container_id: containerId,
      });
    } else {
      await knex<ContainerDeviceDbTable>('container_device_db').insert(options);
    }
  }

  static async removeDeviceDbOptionsOfContainer(deviceId: string, containerId: string) {
    await knex<ContainerDeviceDbTable>('container_device_db').delete().where({
      device_id: deviceId,
      container_id: containerId,
    });
  }

  static async getDeviceRepositoryOptionsOfContainer(deviceId: string, containerId: string):Promise<ContainerDeviceRepositoryTable> {
    return knex<ContainerDeviceRepositoryTable>('container_device_repository')
      .select('container_device_repository.*')
      .where({
        container_id: containerId,
        device_id: deviceId,
      }).first();
  }

  static async setDeviceRepositoryOptionsOfContainer(deviceId: string, containerId: string, options: ContainerDeviceRepositoryTable) {
    if (await DeviceModel.getDeviceRepositoryOptionsOfContainer(deviceId, containerId)) {
      await knex<ContainerDeviceRepositoryTable>('container_device_repository').update(options).where({
        device_id: deviceId,
        container_id: containerId,
      });
    } else {
      await knex<ContainerDeviceRepositoryTable>('container_device_repository').insert(options);
    }
  }

  static async removeDeviceRepositoryOptionsOfContainer(deviceId: string, containerId: string) {
    await knex<ContainerDeviceRepositoryTable>('container_device_repository').delete().where({
      device_id: deviceId,
      container_id: containerId,
    });
  }

  static async getDeviceEnvsOfContainer(deviceId: string, containerId: string):Promise<ContainerDeviceEnvOptionTable[]> {
    return knex<ContainerDeviceEnvOptionTable>('container_device_env_option')
      .select('container_device_env_option.*')
      .where({
        container_id: containerId,
        device_id: deviceId,
      });
  }


  static async getDevicesOfContainer(containerId: string):Promise<(DeviceTable)[]> {
    return knex<DeviceTable>('device').select('device.*')
      .leftJoin('container_device', 'device.id', 'container_device.device_id')
      .leftJoin('driver', 'device.driver_id', 'driver.id')
      .leftJoin('app_instance', 'driver.app_id', 'app_instance.app_id')
      .leftJoin('container', 'app_instance.id', 'container.app_instance_id')
      .where('container_device.container_id', containerId);
  }

  static async getDeviceFromContainer(containerId: string):Promise<DeviceTable> {
    return knex<DeviceTable>('device').select('device.*')
      .leftJoin('driver', 'device.driver_id', 'driver.id')
      .leftJoin('app_instance', 'driver.app_id', 'app_instance.app_id')
      .leftJoin('container', 'app_instance.id', 'container.app_instance_id')
      .where('container.id', containerId)
      .first();
  }

  static async addDeviceToContainer(input: { containerDeviceId: string, containerId: string, deviceId: string }) {
    await knex<ContainerDeviceTable>('container_device').insert({
      id: input.containerDeviceId,
      container_id: input.containerId,
      device_id: input.deviceId,
    });
  }  

  static async removeDeviceFromContainer(input: { containerId: string, deviceId: string }) {
    await knex<ContainerDeviceTable>('container_device').delete().where({
      container_id: input.containerId,
      device_id: input.deviceId,
    });
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
    await knex<ContainerDeviceAuxOptionTable>('container_device_aux_option').delete().where({
      container_id: input.containerId,
      device_id: input.deviceId,
    });
    await knex<ContainerDeviceEnvOptionTable>('container_device_env_option').delete().where({
      container_id: input.containerId,
      device_id: input.deviceId,
    });
  }

  static async removeOptionsOfDeviceFromContainer(input: { containerId: string, deviceId: string }) {
    await knex<ContainerDeviceAuxOptionTable>('container_device_aux_option').delete().where({
      container_id: input.containerId,
      device_id: input.deviceId,
    });
    await knex<ContainerDeviceEnvOptionTable>('container_device_env_option').delete().where({
      container_id: input.containerId,
      device_id: input.deviceId,
    });
  }

  static async removeDevicesFromContainer(containerId: string) {
    await knex<ContainerDeviceTable>('container_device').delete().where('container_id', containerId);
  }

  static async removeEnvsFromContainer(containerId: string) {
    await knex<ContainerDeviceEnvOptionTable>('container_device_env_option').delete().where('container_id', containerId);
  }

  static async removeOptionsFromContainer(containerId: string) {
    await knex<ContainerDeviceAuxOptionTable>('container_device_aux_option').delete().where('container_id', containerId);
  }

  static async removeDevice(deviceId: string) {
    await knex<DeviceTable>('device').delete().where('id', deviceId);
  }

  static async removeDriver(driverId: string) {
    await knex<DriverTable>('driver').delete().where('id', driverId);
  }

  static async updateDeviceType(deviceId: string, deviceTypeId: string) {
    await knex<DeviceTable>('device').update({ device_type_id: deviceTypeId }).where('id', deviceId);
  }
}

export default DeviceModel;