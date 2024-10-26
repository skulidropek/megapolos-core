import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import fsSync from 'fs';import docker from '../coreDocker';
import { ContainerDeviceEnvOptionTable, ContainerEnvOptionTable, ContainerResourceEnvOptionTable, ContainerTable, ContainerVolumeTable } from '../modules/models/tables';
import EventsObserver from '../modules/events/eventsObserver';
import ContainerProcess from './ContainerProcess';
import MegapolosNode from './Node';
import Image from './Image';
import Instance from './Instance';
import { ContainerInput, ContainerResult } from '../types';
import Volume from './Volume';
import { promisify } from 'util';
import BaseRepository from './BaseRepository';
import { knex } from '../corePostgres';

const exec = promisify(require('child_process').exec);

export enum ContainerLifeStatus {
  Stopped = 'stopped',
  Running = 'running',
}

class Container extends BaseRepository<ContainerTable> {
  getTable() {
    return 'container';
  }

  async create(data: Partial<ContainerTable>): Promise<ContainerTable> {
    const node = new MegapolosNode(data.node_id);
    let outerPort = await node.getPort();
    if (data.outer_port) {
      await node.checkPort(data.outer_port);
      outerPort = data.outer_port;
    }
    data.outer_port = outerPort;
    return super.create(data);
  }

  async updateLifeStatus(status: string): Promise<void> {
    await this.edit({ life_status: status });
  }

  async getDockerContainer() {
    const data = await this.getData();
    const node = new MegapolosNode(data.node_id);
    return node.getDockerContainer(this.id);
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

  async edit(data: Partial<ContainerTable>): Promise<ContainerTable> {
    const entity = await this.getData();
    if (data.outer_port) {
      if (data.outer_port !== entity.outer_port) {
        const node = new MegapolosNode(data.node_id || entity.node_id);
        await node.checkPort(data.outer_port);
      }
    }
    return super.edit(data);
  }

  async delete():Promise<boolean> {
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

    const volumes = await new Volume().getVolumesOfContainer(this.id);
    for (let i in volumes) {
      const volume = volumes[i];
      await this.removeVolume(volume.id);
    }
  
    return super.delete();
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

  async removeVolume(containerVolumeId: string): Promise<void> {
    const volumes = await new Volume().getVolumesOfContainer(this.id);
    const volumeContainer = volumes.find((_volume) => _volume.id === containerVolumeId);
    if (!volumeContainer) {
      throw new Error('Volume not found');
    }
    if (volumeContainer.is_dynamic) {
      const volumePath = MegapolosNode.currentNode.getMegapolosPath() + '/volumes/' + this.id + '/' + volumeContainer.id;
      MegapolosNode.currentNode.validatePath(volumePath);
      try {
        // await exec(`umount ${volumePath}`);
      } catch (e) {
        console.trace(e);
        EventsObserver.listener({ type: 'volumeError', data: { containerId: this.id, error: e } });
      }
      // await fs.rmdir(volumePath);
    }
    await new Volume().removeFromContainer(containerVolumeId);
  }

  async getDataWithDetails(): Promise<ContainerResult> {
    const container: ContainerResult = await this.getData();
    const volumes = await new Volume().getVolumesOfContainer(container.id);
    container.volumes = volumes;
    const envs = await this.getContainerEnvOptions();
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

  async changeEnvs(input: {
    key: string,
    value: string,
  }[]) {
    await this.removeContainerEnvOptions();
    for (let i in input) {
      const env = input[i];
      const envId = uuidv4();
      console.log(env);
      await this.addContainerEnvOption({
        id: envId,
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
    await this.edit({ docker_runtime_id: id });
  }

  async getEnvs():Promise<ContainerEnvOptionTable[]> {
    return this.getContainerEnvOptions();
  }

  async getVolumes(): Promise<{ containerVolume: ContainerVolumeTable, volume: Volume }[]> {
    const containerVolumes = await new Volume().getVolumesOfContainer(this.id);
    return containerVolumes.map((containerVolume) => ({
      containerVolume,
      volume: new Volume(containerVolume.volume_id),
    }));
  }

  async getDockerLog(): Promise<string> {
    const data = await this.getData();
    return new MegapolosNode(data.node_id).getDockerContainerLog(data.id);
  }

  async listFiles(path: string): Promise<{ files: string[], directories: string[] }> {
    const output = await this.shellCommand(`ls -p ${path}`).output;
    const files: string[] = [];
    const directories: string[] = [];
    output.stdout.split('\n').forEach((line) => {
      if (line === '') {
        return;
      }
      if (line.endsWith('/')) {
        directories.push((path === '/' ? path : path + '/') + line.slice(0, -1));
      } else {
        files.push((path === '/' ? path : path + '/') + line);
      }
    });
    return { files, directories };
  }

  async showFile(path: string): Promise<string> {
    const output = await this.shellCommand(`cat ${path}`).output;
    return output.stdout;
  }

  async getContainerEnvOptions():Promise<ContainerEnvOptionTable[]> {
    return knex<ContainerEnvOptionTable>('container_env_option')
      .select('container_env_option.*')
      .where('container_env_option.container_id', this.id);
  }

  async addContainerEnvOption(input: Partial<ContainerEnvOptionTable>) {
    await knex<ContainerEnvOptionTable>('container_env_option').insert({
      container_id: this.id,
      ...input
    });
  }

  async removeContainerEnvOptions() {
    await knex<ContainerEnvOptionTable>('container_env_option').delete().where('container_id', this.id);
  }
}

export default Container;