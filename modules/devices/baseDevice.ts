/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { gql, GraphQLClient } from 'graphql-request';
import { v4 as uuidv4 } from 'uuid';
import DeviceModel from '../models/device.model';
import { ContainerDeviceAuxOptionTable, ContainerDeviceEnvOptionTable, DeviceOptionTable, DeviceTable, DriverTable } from '../models/tables';
import Container from '../../classes/Container';
import Volume from '../../classes/Volume';
import VolumeModel from '../models/volume.model';
import DeviceBackup from '../../classes/DeviceBackup';
import { ContainerDeviceInput, DeviceInput } from '../../types';
import EventsObserver from '../events/eventsObserver';
import DatabaseDevice from './databaseDevice';
import DomainDevice from './domainDevice';
import CertificateDevice from './certificateDevice';
import BuilderDevice from './builderDevice';
import RepositoryDevice from './repositoryDevice';
import App from '../../classes/App';
import { sleep } from '../..';

export interface Manifest {
  name: string;
  type: string;
  fields: [string];
  container_aux_fields: [string];
  container_env_fields: [string];
}

class BaseDevice {
  client: Promise<GraphQLClient>;

  id: string;

  port: number;

  constructor(id: string) {
    this.id = id;
    this.client = DeviceModel.getDeviceDriverContainer(this.id).then((device) => {
      this.port = device.outer_port;
      return new GraphQLClient(`http://localhost:${this.port}/graphql`);
    });
  }

  static async createDevice(userId:string, input: DeviceInput): Promise<BaseDevice> {
    const app = await App.installApp(userId, {
      name: input.name,
      images: [{
        name: input.name,
        image: input.image,
        inner_port: input.inner_port,
      }],
    });
    const images = await app.getImages();
    const appInstance = await app.createInstance(input.name, [{
      devices: [],
      envs: [],
      volumes: [],
      fixed_outer_port: 0,
      image_id: images[0].id,
    }], true);
    await appInstance.start();

    return BaseDevice.createDeviceFromApp(app);
  }

  static async createDeviceFromApp(app: App): Promise<BaseDevice> {
    const deviceId = uuidv4();
    const driverId = uuidv4();

    const appData = await app.getData();

    await DeviceModel.createDriver({
      id: driverId,
      name: appData.name,
      app_id: app.id,
    });
    await DeviceModel.createDevice({
      id: deviceId,
      name: appData.name,
      device_type_id: '',
      node_id: '',
      driver_id: driverId,
    });
    const device = new BaseDevice(deviceId);
    let manifest: Manifest | undefined;
    for (let i = 0; i < 10; i++) {
      try {
        manifest = await device.getManifest();
        break;
      } catch (e) {
        await sleep(1000);
      }
    }
    if (!manifest) {
      throw new Error('Failed to get manifest');
    }
    if (manifest.type) {
      await DeviceModel.updateDeviceType(deviceId, manifest.type);
    }
    EventsObserver.listener({ type: 'createDevice', data: app.id });

    return device;
  }

  static getDevices(): Promise<BaseDevice[]> {
    return DeviceModel.getDevices().then((devices) => devices.map((device) => new BaseDevice(device.id)));
  }

  async getDriver(): Promise<DriverTable> {
    const data = await this.getData();
    return DeviceModel.getDriver(data.driver_id);
  }

  async getData(): Promise<DeviceTable> {
    return DeviceModel.getDevice(this.id);
  }

  async getDriverContainer(): Promise<Container> {
    const container = await DeviceModel.getDeviceDriverContainer(this.id);
    return new Container(container.id);
  }
  
  getOptions():Promise<DeviceOptionTable[]> {
    return DeviceModel.getDeviceOptions(this.id);
  }

  setOptions(options:{ key: string, value:string }[]):Promise<void> {
    return DeviceModel.setDeviceOptions(this.id, options);
  }

  getContainerAuxOptions(containerId:string):Promise<ContainerDeviceAuxOptionTable[]> {
    return DeviceModel.getDeviceAuxOptionsOfContainer(this.id, containerId);
  }

  setContainerAuxOptions(containerId:string, options:{ key: string, value:string }[]):Promise<void> {
    return DeviceModel.setDeviceAuxOptionsOfContainer(this.id, containerId, options);
  }

  getContainerEnvOptions(containerId:string):Promise<ContainerDeviceEnvOptionTable[]> {
    return DeviceModel.getDeviceEnvsOfContainer(this.id, containerId);
  }

  setContainerEnvOptions(containerId:string, options:{ key: string, value:string }[]):Promise<void> {
    return DeviceModel.setDeviceAuxOptionsOfContainer(this.id, containerId, options);
  }

  async addToContainer(containerId: string, input: ContainerDeviceInput): Promise<void> {
    const containerDeviceId = uuidv4();
    await DeviceModel.addDeviceToContainer({
      containerDeviceId,
      containerId,
      deviceId: this.id,
    });

    if (input.env_parameters) {
      for (let i in input.env_parameters) {
        const containerDeviceEnvId = uuidv4();
        await DeviceModel.addEnvToContainer({
          id: containerDeviceEnvId,
          container_id: containerId,
          device_id: this.id,
          device_option_name: input.env_parameters[i].key,
          container_env_name: input.env_parameters[i].value,
        });
      }
    }
    if (input.parameters) {
      for (let i in input.parameters) {
        const containerDeviceEnvId = uuidv4();
        await DeviceModel.addAuxOptionToContainer({
          id: containerDeviceEnvId,
          container_id: containerId,
          device_id: this.id,
          device_option_name: input.parameters[i].key,
          container_option_value: input.parameters[i].value,
        });
      }
    }

    console.log(await DeviceModel.getDeviceAuxOptionsOfContainer(this.id, containerId));
  }

  async removeFromContainer(containerId: string): Promise<void> {
    await DeviceModel.removeDeviceFromContainer({
      containerId: containerId,
      deviceId: this.id,
    });
  }

  async setContainerOptions(containerId: string, input: ContainerDeviceInput): Promise<void> {
    await DeviceModel.removeOptionsOfDeviceFromContainer({ containerId, deviceId: this.id });
    if (input.env_parameters) {
      for (let i in input.env_parameters) {
        const containerDeviceEnvId = uuidv4();
        await DeviceModel.addEnvToContainer({
          id: containerDeviceEnvId,
          container_id: containerId,
          device_id: this.id,
          device_option_name: input.env_parameters[i].key,
          container_env_name: input.env_parameters[i].value,
        });
      }
    }
    if (input.parameters) {
      for (let i in input.parameters) {
        const containerDeviceEnvId = uuidv4();
        await DeviceModel.addAuxOptionToContainer({
          id: containerDeviceEnvId,
          container_id: containerId,
          device_id: this.id,
          device_option_name: input.parameters[i].key,
          container_option_value: input.parameters[i].value,
        });
      }
    }

    EventsObserver.listener({ 'type': 'updateDeviceToContainer', data: { containerId, id: this.id } });
  }

  setVirtual(is_virtual: number, virtual_device_container_id: string):Promise<void> {  
    return DeviceModel.setDeviceVirtual(this.id, is_virtual, is_virtual ? virtual_device_container_id : null);
  }

  async setBackupVolume(volume: Volume):Promise<boolean> {
    return VolumeModel.setDeviceBackupVolume(this.id, volume.id);
  }

  async removeBackupVolume():Promise<boolean> {
    return VolumeModel.removeDeviceBackupVolume(this.id);
  }

  async request(query: string, variables?: any): Promise<any> {
    return (await this.client).request(query, variables);
  }

  async getManifest():Promise<Manifest> {
    return (await this.request(gql`
      query {
        getManifest {
          name
          type
          fields
          container_aux_fields
          container_env_fields
        }
      }
      `)).getManifest;
  }

  async getAuxFields():Promise<[string]> {
    return (await this.getManifest()).container_aux_fields;
  }

  async getEnvFields():Promise<[string]> {
    return (await this.getManifest()).container_env_fields;
  }

  async getEnvFieldsValues(containerId: string):Promise<{ key: string, value: string }[]> {
    try {
      return (await this.request(gql`
      query($containerId: String) {
        getContainerOptionsEnv(containerId: $containerId) {
          key
          value
        }
      }
    `, { containerId })).getContainerOptionsEnv;
    } catch (e) {
      console.trace(e);
      EventsObserver.listener({ type: 'error', data: e });
      return [];
    }
  }

  async removeDevice():Promise<void> {
    const driver = await this.getDriver();
    await new App(this.id).uninstall();
    await DeviceModel.removeDevice(this.id);
    await DeviceModel.removeDriver(driver.id);
  }

}

export default BaseDevice;