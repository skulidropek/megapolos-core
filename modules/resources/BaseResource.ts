import { v4 as uuidv4 } from 'uuid';
import ResourceModel from '../models/resource.model';
import { ContainerResourceEnvOptionTable, ResourceTable } from '../models/tables';
import Container from '../../classes/Container';

class BaseResource {
  id:string;

  constructor(id:string) {
    this.id = id;
  }

  async getData():Promise<ResourceTable> {
    return ResourceModel.getResource(this.id);
  }

  getContainerEnvOptions(containerId:string):Promise<ContainerResourceEnvOptionTable[]> {
    return ResourceModel.getResourceEnvsOfContainer(this.id, containerId);
  }

  setContainerEnvOptions(containerId:string, options:{ key: string, value:string }[]):Promise<void> {
    return ResourceModel.setResourceEnvOptionsOfContainer(this.id, containerId, options);
  }

  async addToContainer(containerId: string, envs:{ key:string, values: string }): Promise<void> {
    const containerResourceId = uuidv4();
    await ResourceModel.addResourceToContainer({
      containerResourceId,
      containerId,
      resourceId: this.id,
    });

    if (envs) {
      for (let i in envs) {
        const containerDeviceEnvId = uuidv4();
        await ResourceModel.addEnvToContainer({
          id: containerDeviceEnvId,
          container_id: containerId,
          resource_id: this.id,
          resource_option_name: envs[i].key,
          container_env_name: envs[i].value,
        });
      }
    }
  }

  async removeFromContainer(containerId: string): Promise<void> {
    await ResourceModel.removeResourceFromContainer({
      containerId: containerId,
      resourceId: this.id,
    });
  }

  getContainers():Promise<Container[]> {
    return ResourceModel.getContainersOfResource(this.id).then((containers) => containers.map((container) => new Container(container.id)));
  }
}

export default BaseResource;