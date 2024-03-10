import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import fsSync from 'fs';import docker from '../coreDocker';
import AppInstanceModel from '../modules/models/appInstance.model';
import { ContainerDeviceEnvOptionTable, ContainerEnvOptionTable, ContainerResourceEnvOptionTable, ContainerTable, ContainerVolumeTable } from '../modules/models/tables';
import EventsObserver from '../modules/events/eventsObserver';
import ContainerProcess from './ContainerProcess';
import MegapolosNode from './Node';
import BaseDevice from '../modules/devices/baseDevice';
import DeviceModel from '../modules/models/device.model';
import Image from './Image';
import Instance from './Instance';
import ContainerCreate from './ContainerCreate';
import { ContainerInput, ContainerResult } from '../types';
import Volume from './Volume';
import VolumeModel from '../modules/models/volume.model';
import BaseDeviceWithType from '../modules/devices/BaseDeviceWithType';
import { promisify } from 'util';
import ResourceModel from '../modules/models/resource.model';
import BaseResource from '../modules/resources/BaseResource';
import BaseResourceWithType from '../modules/devices/ResourceDeviceWithType';
import Entity from '../modules/models/Entity';

const exec = promisify(require('child_process').exec);

export enum ContainerLifeStatus {
  Stopped = 'stopped',
  Running = 'running',
}

class Container {
  id: string;

  static async getContainersData(): Promise<ContainerTable[]> {
    return new Entity<ContainerTable>('container').findAll();
  }

  static async getContainers(): Promise<Container[]> {
    const data = await this.getContainersData();
    return data.map((item) => new Container(item.id));
  }

  constructor(id: string) {
    this.id = id;
  }

  static async create(instanceId: string, data: Partial<ContainerTable>): Promise<Container> {
    const entity = new Entity<ContainerTable>('container');
    let outerPort = await MegapolosNode.currentNode.getPort();
    if (data.outer_port) {
      const node = new MegapolosNode(data.node_id);
      await node.checkPort(data.outer_port);
      outerPort = data.outer_port;
    }
    data.outer_port = outerPort;
    const result = await entity.create({ app_instance_id: instanceId, ...data });
    return new Container(result.id);
  }

  static createFromImage(instance: Instance, image: Image, input: ContainerInput): Promise<Container> {
    const containerCreate = new ContainerCreate();
    return containerCreate.create(instance, image, input);
  }

  async updateLifeStatus(status: string): Promise<void> {
    await AppInstanceModel.updateContainerLifeStatus(this.id, status);
  }

  async getDockerContainer() {
    const data = await this.getData();
    return docker.getContainer(data.docker_runtime_id);
  }

  async start() {
    try {
      // await (await this.getDockerContainer()).start();
    } catch (e) {
      console.trace(e);
      EventsObserver.listener({ type: 'containerError', data: { containerId: this.id, error: e } });
    }
        
    await this.updateLifeStatus('running');
  }

  async stop() {
    try {
      // await (await this.getDockerContainer()).stop();
    } catch (e) {
      console.trace(e);
      EventsObserver.listener({ type: 'containerError', data: { containerId: this.id, error: e } });
    }
      
    await this.updateLifeStatus('stopped');
  }

  async edit(data: Partial<ContainerTable>): Promise<void> {
    const entity = await this.getData();
    if (data.outer_port) {
      if (data.outer_port !== entity.outer_port) {
        const node = new MegapolosNode(data.node_id || entity.node_id);
        await node.checkPort(data.outer_port);
      }
    }
    await new Entity<ContainerTable>('container').update({ id: this.id }, data);
  }

  async remove():Promise<void> {
    const data = await this.getData();
    if (data.docker_runtime_id) {
      try {
        await this.stop();
      } catch (e) {
        console.trace(e);
      }
      try {
        // await (await this.getDockerContainer()).remove();
      } catch (e) {
        console.trace(e);
        EventsObserver.listener({ type: 'containerError', data: { containerId: this.id, error: e } });
      }
    }
    const megapolosVolume = MegapolosNode.currentNode.getMegapolosPath() + '/volumes/' + this.id;
    if (fsSync.existsSync(megapolosVolume)) {
      MegapolosNode.currentNode.validatePath(megapolosVolume);
      // await fs.rmdir(megapolosVolume, { recursive: true });
    }

    const volumes = await VolumeModel.getVolumesOfContainer(this.id);
    for (let i in volumes) {
      const volume = volumes[i];
      await this.removeVolume(volume.id);
    }
  
    const devices = await this.getDevices();
    for (let i in devices) {
      const device = devices[i];
      await device.removeFromContainer(this.id);
    }
    await AppInstanceModel.deleteContainer(this.id);
  }

  async restore() {
    const container = await this.getData();
    try {
      if (!container.docker_runtime_id) {
        return;
      }
      const containerInfo = await (await this.getDockerContainer()).inspect();
      if (container.life_status === 'running' && !containerInfo.State.Running) {
        try {
          await this.start();
        } catch (e) {
          console.trace(e);
          EventsObserver.listener({ type: 'containerError', data: { containerId: this.id, error: e } });
        }
      }
      if (container.life_status === 'stopped' && containerInfo.State.Running) {
        try {
          await this.stop();
        } catch (e) {
          console.trace(e);
          EventsObserver.listener({ type: 'containerError', data: { containerId: this.id, error: e } });
        }
      }
    } catch (e) {
      console.trace(e);
      EventsObserver.listener({ type: 'containerError', data: { containerId: this.id, error: e } });
    }
  }

  getData(): Promise<ContainerTable> {
    return AppInstanceModel.getContainer(this.id);
  }

  async removeVolume(containerVolumeId: String): Promise<void> {
    const volumes = await VolumeModel.getVolumesOfContainer(this.id);
    const volumeContainer = volumes.find((_volume) => _volume.id === containerVolumeId);
    if (!volumeContainer) {
      throw new Error('Volume not found');
    }
    if (volumeContainer.is_dynamic) {
      const volumePath = MegapolosNode.currentNode.getMegapolosPath() + '/volumes/' + this.id + '/' + volumeContainer.id;
      MegapolosNode.currentNode.validatePath(volumePath);
      try {
        await exec(`umount ${volumePath}`);
      } catch (e) {
        console.trace(e);
        EventsObserver.listener({ type: 'volumeError', data: { containerId: this.id, error: e } });
      }
      // await fs.rmdir(volumePath);
    }
    await VolumeModel.removeVolumeFromContainer(containerVolumeId);
  }

  async getDataWithDetails(): Promise<ContainerResult> {
    const container: ContainerResult = await this.getData();
    const devices = await DeviceModel.getDevicesOfContainer(container.id);
    container.devices = [];
    for (let k in devices) {
      const auxOptions = await DeviceModel.getDeviceAuxOptionsOfContainer(devices[k].id, container.id);
      const envs = await DeviceModel.getDeviceEnvsOfContainer(devices[k].id, container.id);
      container.devices.push({
        device: devices[k],
        parameters: auxOptions.map((option) => ({ key: option.device_option_name, value: option.container_option_value })),
        env_parameters: envs.map((env) => ({ key: env.device_option_name, value: env.container_env_name })),
      });
    }
    const volumes = await VolumeModel.getVolumesOfContainer(container.id);
    container.volumes = volumes;
    const envs = await AppInstanceModel.getContainerEnvOptions(container.id);
    container.envs = envs.map((env) => ({ key: env.container_env_name, value: env.container_env_value }));
    if (container.docker_runtime_id) {
      try {
        const dockerStatus = (await docker.getContainer(container.docker_runtime_id).inspect()).State.Status;
        container.docker_status = dockerStatus;
      } catch (e) {
        container.docker_status = 'not exist';
      }
    }

    return container;
  }

  async getDevices():Promise<BaseDevice[]> {
    return (await DeviceModel.getDevicesOfContainer(this.id)).map((device) => new BaseDevice(device.id));
  }

  async getDeviceOfType(type: string): Promise<BaseDevice> {
    const containerDevices = await DeviceModel.getDevicesOfContainer(this.id);
    const device = containerDevices.find((_device) => _device.device_type_id === type);
    if (device) {
      return BaseDeviceWithType.getDeviceWithType(device.id);
    }
    return undefined;
  } 
  
  async getResources():Promise<BaseResource[]> {
    return (await ResourceModel.getResourcesOfContainer(this.id)).map((resource) => new BaseResource(resource.id));
  }

  async getResourceOfType(type: string): Promise<BaseResource> {
    const containerResources = await ResourceModel.getResourcesOfContainer(this.id);
    const resource = containerResources.find((_resource) => _resource.resource_type === type);
    if (resource) {
      return BaseResourceWithType.getResourceWithType(resource.id);
    }
    return undefined;
  } 

  async changeEnvs(input: {
    key: string,
    value: string,
  }[]) {
    await AppInstanceModel.removeContainerEnvOptions(this.id);
    for (let i in input) {
      const env = input[i];
      const envId = uuidv4();
      console.log(env);
      await AppInstanceModel.addContainerEnvOption({
        id: envId,
        container_id: this.id,
        container_env_name: env.key,
        container_env_value: env.value,
      });
    }
  }

  shellCommand(command: string): { id: string, output: Promise<{ stdout: string, stderr: string }> } {
    const commandId = uuidv4();
    return { id: commandId, output: (async () => {
      const process = new ContainerProcess(command, this);
      MegapolosNode.currentNode.commands[commandId] = process;
      process.onoutput = (data) => {
        EventsObserver.listener({ type: 'shellCommandOutput', data: data });
      };
      process.onerror = (data) => {
        EventsObserver.listener({ type: 'shellCommandError', data: data });
      };

      await process.start();

      const result = {
        stdout: process.stdout,
        stderr: process.stderr,
      };
    
      // const result = await exec(command,
      // // , { uid: parseInt(osUserId) }
      // );
      return result;
    })() };
  }

  async getInstance(): Promise<Instance> {
    const data = await this.getData();
    return new Instance(data.app_instance_id);
  }

  async getImage(): Promise<Image> {
    const data = await this.getData();
    return new Image(data.image_id);
  }

  async updateDockerRuntimeId(id: string):Promise<void> {
    await AppInstanceModel.updateContainerDockerRuntimeId(this.id, id);
  }

  async getEnvs():Promise<ContainerEnvOptionTable[]> {
    return AppInstanceModel.getContainerEnvOptions(this.id);
  }

  async getDevicesEnvs():Promise<ContainerDeviceEnvOptionTable[]> {
    return DeviceModel.getEnvOfContainer(this.id);
  }

  async getResourcesEnvs():Promise<ContainerResourceEnvOptionTable[]> {
    return ResourceModel.getEnvOfContainer(this.id);
  }

  async getDeviceOfDriver(): Promise<BaseDevice> {
    const data = await DeviceModel.getDeviceFromContainer(this.id);
    return data ? new BaseDevice(data.id) : undefined;
  }

  async getVolumes(): Promise<{ containerVolume: ContainerVolumeTable, volume: Volume }[]> {
    const containerVolumes = await VolumeModel.getVolumesOfContainer(this.id);
    return containerVolumes.map((containerVolume) => ({
      containerVolume,
      volume: new Volume(containerVolume.volume_id),
    }));
  }

  async getDockerLog(): Promise<string> {
    const data = await this.getData();
    return new MegapolosNode(data.node_id).getDockerContainerLog(data.id);
  }

  async update(noRebuild: boolean):Promise<void> {
    const data = await this.getData();
    if (data.docker_runtime_id) {
      try {
        await this.stop();
      } catch (e) {
        console.trace(e);
        EventsObserver.listener({ type: 'containerError', data: { containerId: this.id, error: e } });
      }
      try {
        // await (await this.getDockerContainer()).remove();
      } catch (e) {
        console.trace(e);
        EventsObserver.listener({ type: 'containerError', data: { containerId: this.id, error: e } });
      }
    }
    const containerCreate = new ContainerCreate();
    await containerCreate.build(this, noRebuild);
  }
}

export default Container;