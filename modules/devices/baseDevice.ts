/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { gql, GraphQLClient } from 'graphql-request';
import DeviceModel from '../models/device.model';
import { DeviceTable, DriverTable } from '../models/tables';
import Container from '../../classes/Container';

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
  
  async remove() {
    
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