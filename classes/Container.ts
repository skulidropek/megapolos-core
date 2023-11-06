import { v4 as uuidv4 } from 'uuid';
import docker from '../coreDocker';
import AppInstanceModel from '../modules/models/appInstance.model';
import { ContainerTable } from '../modules/models/tables';
import EventsObserver from '../modules/events/eventsObserver';
import ContainerProcess from './ContainerProcess';
import MegapolosNode from './Node';
import BaseDevice from '../modules/devices/baseDevice';
import DeviceModel from '../modules/models/device.model';

export enum ContainerLifeStatus {
  Stopped = 'stopped',
  Running = 'running',
}

class Container {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  async start() {
    const container = await this.getData();
    try {
      await docker.getContainer(container.docker_runtime_id).start();
    } catch (e) {
      console.error(e);
    }
        
    await AppInstanceModel.updateContainerLifeStatus(container.id, 'running');
  }

  async stop() {
    const container = await this.getData();
    try {
      await docker.getContainer(container.docker_runtime_id).stop();
    } catch (e) {
      console.error(e);
    }
      
    await AppInstanceModel.updateContainerLifeStatus(container.id, 'stopped');
  }

  remove() {

  }

  async restore() {
    const container = await this.getData();
    try {
      if (!container.docker_runtime_id) {
        return;
      }
      const containerInfo = await docker.getContainer(container.docker_runtime_id).inspect();
      if (container.life_status === 'running' && !containerInfo.State.Running) {
        try {
          await docker.getContainer(container.docker_runtime_id).start();
        } catch (e) {
          console.error(e);
        }
      }
      if (container.life_status === 'stopped' && containerInfo.State.Running) {
        try {
          await docker.getContainer(container.docker_runtime_id).stop();
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

  async getDockerContainer() {
    return docker.getContainer((await this.getData()).docker_runtime_id);
  }

  async getDevices():Promise<BaseDevice[]> {
    return (await DeviceModel.getDevicesOfContainer(this.id)).map((device) => new BaseDevice(device.id));
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

  addVolume() {

  }

  removeVolume() {
    
  }

  build() {

  }

  update() {
  }
}

export default Container;