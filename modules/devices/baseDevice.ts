/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { gql, GraphQLClient } from 'graphql-request';
import { v4 as uuidv4 } from 'uuid';
import DeviceModel from '../models/device.model';
import { ContainerDeviceAuxOptionTable, ContainerDeviceEnvOptionTable, DeviceOptionTable, DeviceTable, DriverTable } from '../models/tables';
import Container from '../../classes/Container';
import Volume from '../../classes/Volume';
import VolumeModel from '../models/volume.model';
import DeviceBackup from '../../classes/DeviceBackup';
import { ContainerDeviceInput } from '../../types';
import EventsObserver from '../events/eventsObserver';
import DatabaseDevice from './databaseDevice';
import DomainDevice from './domainDevice';
import CertificateDevice from './certificateDevice';
import BuilderDevice from './builderDevice';
import RepositoryDevice from './repositoryDevice';

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

  static getDevices(): Promise<BaseDevice[]> {
    return DeviceModel.getDevices().then((devices) => devices.map((device) => new BaseDevice(device.id)));
  }

  static async getDeviceWithType(id: string): Promise<BaseDevice> {
    const data = await DeviceModel.getDevice(id);
    if (data.device_type_id === 'db') {
      return new DatabaseDevice(id);
    } 
    if (data.device_type_id === 'domain') {
      return new DomainDevice(id);
    } 
    if (data.device_type_id === 'certificate') {
      return new CertificateDevice(id);
    } 
    if (data.device_type_id === 'repository') {
      return new RepositoryDevice(id);
    } 
    if (data.device_type_id === 'builder') {
      return new BuilderDevice(id);
    }
    return new BaseDevice(id);
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
  
  // async remove() {
    
  // }

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
      console.error(e);
      return [];
    }
  }

}

export default BaseDevice;