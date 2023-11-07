import { v4 as uuidv4 } from 'uuid';
import docker from '../coreDocker';
import AppInstanceModel from '../modules/models/appInstance.model';
import { ContainerDeviceEnvOptionTable, ContainerEnvOptionTable, ContainerTable, ContainerVolumeTable } from '../modules/models/tables';
import EventsObserver from '../modules/events/eventsObserver';
import ContainerProcess from './ContainerProcess';
import MegapolosNode from './Node';
import BaseDevice from '../modules/devices/baseDevice';
import DeviceModel from '../modules/models/device.model';
import Image from './Image';
import Instance from './Instance';
import ContainerCreate from './ContainerCreate';
import { ContainerInput } from '../types';
import Volume from './Volume';
import VolumeModel from '../modules/models/volume.model';

export enum ContainerLifeStatus {
  Stopped = 'stopped',
  Running = 'running',
}

class Container {
  id: string;

  constructor(id: string) {
    this.id = id;
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
      await (await this.getDockerContainer()).start();
    } catch (e) {
      console.error(e);
    }
        
    await this.updateLifeStatus('running');
  }

  async stop() {
    try {
      await (await this.getDockerContainer()).stop();
    } catch (e) {
      console.error(e);
    }
      
    await this.updateLifeStatus('stopped');
  }

  remove() {

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
          console.error(e);
        }
      }
      if (container.life_status === 'stopped' && containerInfo.State.Running) {
        try {
          await this.stop();
        } catch (e) {
          console.error(e);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  getData(): Promise<ContainerTable> {
    return AppInstanceModel.getContainer(this.id);
  }

  async getDevices():Promise<BaseDevice[]> {
    return (await DeviceModel.getDevicesOfContainer(this.id)).map((device) => new BaseDevice(device.id));
  }

  async getDeviceOfType(type: string): Promise<BaseDevice> {
    const containerDevices = await DeviceModel.getDevicesOfContainer(this.id);
    const device = containerDevices.find((_device) => _device.device_type_id === type);
    if (device) {
      return new BaseDevice(device.id);
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

  async getDeviceOfDriver(): Promise<BaseDevice> {
    const data = await DeviceModel.getDeviceFromContainer(this.id);
    return new BaseDevice(data.id);
  }

  async getVolumes(): Promise<{containerVolume: ContainerVolumeTable, volume: Volume}[]> {
    const containerVolumes = await VolumeModel.getVolumesOfContainer(this.id);
    return containerVolumes.map((containerVolume) => ({
      containerVolume,
      volume: new Volume(containerVolume.volume_id),
    }));
  }

  async update(noRebuild: boolean):Promise<void> {
    const data = await this.getData();
    if (data.docker_runtime_id) {
      try {
        await this.stop();
      } catch (e) {
        console.error(e);
      }
      try {
        await (await this.getDockerContainer()).remove();
      } catch (e) {
        console.error(e);
      }
    }
    const containerCreate = new ContainerCreate();
    await containerCreate.build(this, noRebuild);
  }
}

export default Container;