/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { gql } from 'graphql-request';
import BaseDevice from './baseDevice';
import { EnvironmentVariable } from '../../types';

class BuilderDevice extends BaseDevice {
  async buildPath(containerId: string, image:string, path:string, envs:EnvironmentVariable[]) {
    return this.client.request(gql`
      mutation($containerId: String, $image: String, $path: String, $envs: [EnvironmentVariableInput]) {
        buildPath($container_id: String, image: $image, path: $path, envs: $envs)
      }
    `, { image, path, containerId });
  }
  async buildContainer(containerId: string, image: string, envs:EnvironmentVariable[]) {
    return this.client.request(gql`
      mutation($containerId: String, $image: String, $envs: [EnvironmentVariableInput]) {
        buildContainer (container_id: $containerId, image: $image, envs: $envs)
      }
    `, { containerId, image, envs });
  }
}

export default BuilderDevice;