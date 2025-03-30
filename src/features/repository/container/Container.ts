import fsSync from 'fs';
import { v4 as uuidv4 } from 'uuid';
import docker from '../../docker/coreDocker';
import { knex } from '../../db/knex';
import EventsObserver from '../../events/eventsObserver';
import {
  ContainerDbTable,
  ContainerEnvOptionTable,
  ContainerTable,
  ContainerVariableTable,
  ContainerVolumeTable,
  DomainTable,
} from '../../db/tables';
import { ContainerResult } from '../../../domain/types';
import BaseRepository from '../BaseRepository';
import ContainerDb from './ContainerDb';
import ContainerProcess from '../../process/ContainerProcess';
import Db from '../db/Db';
import DbUser from '../db/DbUser';
import Domain from '../Domain';
import Image from '../Image';
import Instance, { InstanceRuntimeVariables } from '../Instance';
import MegapolosNode from '../Node';
import Volume from '../Volume';
import { resources } from '../../rights/resources_list';

export enum ContainerLifeStatus {
  Stopped = 'stopped',
  Running = 'running',
}

export interface ContainerRuntimeVariables {
  variables: { [key: string]: string };
  dbs: {
    [key: string]: {
      db: string;
      host: string;
      user: string;
      password: string;
    };
  };
  domain?: string;
  volumes: {
    [key: string]: {
      innerPath: string;
    };
  };
  instance?: InstanceRuntimeVariables;
}

class Container extends BaseRepository<ContainerTable> {
  getTable() {
    return 'container';
  }

  async create(data: Partial<ContainerTable>): Promise<ContainerTable> {
    await this.checkActionAccess(resources.container.actions.create);
    const node = new MegapolosNode(this.ctx, data.node_id);
    let outerPort = await node.getPort();
    if (data.outer_port) {
      await node.checkPort(data.outer_port);
      outerPort = data.outer_port;
    }
    data.outer_port = outerPort;
    return super.create(data);
  }


  async getDockerContainer() {
    const data = await this.getData();
    const node = new MegapolosNode(this.ctx, data.node_id);
    return node.getDockerContainer(this.id);
  }

  async start() {
    await this.checkActionAccess(resources.container.actions.manage);
    try {
      // await (await this.getDockerContainer()).start();
    } catch (e) {
      console.trace(e);
      EventsObserver.listener({
        type: 'containerError',
        data: { containerId: this.id, error: e },
      });
    }

    await this._updateLifeStatus('running');
  }

  async stop() {
    await this.checkActionAccess(resources.container.actions.manage);
    try {
      // await (await this.getDockerContainer()).stop();
    } catch (e) {
      console.trace(e);
      EventsObserver.listener({
        type: 'containerError',
        data: { containerId: this.id, error: e },
      });
    }

    await this._updateLifeStatus('stopped');
  }

  async edit(data: Partial<ContainerTable>): Promise<ContainerTable> {
    await this.checkActionAccess(resources.container.actions.edit);
    const entity = await this.getData();
    if (data.outer_port) {
      if (data.outer_port !== entity.outer_port) {
        const node = new MegapolosNode(this.ctx, data.node_id || entity.node_id);
        await node.checkPort(data.outer_port);
      }
    }
    return super.edit(data);
  }

  async delete(): Promise<boolean> {
    await this.checkActionAccess(resources.container.actions.remove);
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
        EventsObserver.listener({
          type: 'containerError',
          data: { containerId: this.id, error: e },
        });
      }
    }
    const megapolosVolume = MegapolosNode.currentNode.getMegapolosPath()
      + '/volumes/' + this.id;
    if (fsSync.existsSync(megapolosVolume)) {
      MegapolosNode.currentNode.validatePath(megapolosVolume);
      // await fs.rmdir(megapolosVolume, { recursive: true });
    }

    const volumes = await new Volume(this.ctx).getVolumesOfContainer(this.id);
    for (let i in volumes) {
      const volume = volumes[i];
      await this.removeVolume(volume.id);
    }

    return super.delete();
  }

  async restore() {
    await this.checkActionAccess(resources.container.actions.manage);
    const container = await this.getData();
    try {
      if (!container.docker_runtime_id) {
        return;
      }
      const containerInfo = await (await this.getDockerContainer()).inspect();
      if (container.life_status === 'running' && !containerInfo.State.Running) {
        await this.start();
      }
      if (container.life_status === 'stopped' && containerInfo.State.Running) {
        await this.stop();
      }
    } catch (e) {
      console.trace(e);
      EventsObserver.listener({
        type: 'containerError',
        data: { containerId: this.id, error: e },
      });
    }
  }

  async removeVolume(containerVolumeId: string): Promise<void> {
    const volumes = await new Volume(this.ctx).getVolumesOfContainer(this.id);
    const volumeContainer = volumes.find((_volume) =>
      _volume.id === containerVolumeId,
    );
    if (!volumeContainer) {
      throw new Error('Volume not found');
    }
    if (volumeContainer.is_dynamic) {
      const volumePath = MegapolosNode.currentNode.getMegapolosPath()
        + '/volumes/' + this.id + '/' + volumeContainer.id;
      MegapolosNode.currentNode.validatePath(volumePath);
      try {
        // await exec(`umount ${volumePath}`);
      } catch (e) {
        console.trace(e);
        EventsObserver.listener({
          type: 'volumeError',
          data: { containerId: this.id, error: e },
        });
      }
      // await fs.rmdir(volumePath);
    }
    await new Volume(this.ctx).removeFromContainer(containerVolumeId);
  }

  async getDataWithDetails(): Promise<ContainerResult> {
    const container: ContainerResult = await this.getData();
    const volumes = await new Volume(this.ctx).getVolumesOfContainer(container.id);
    container.volumes = volumes;
    const envs = await this.getContainerEnvOptions();
    container.envs = envs.map((env) => ({
      key: env.container_env_name,
      value: env.container_env_value,
    }));
    if (container.docker_runtime_id) {
      try {
        const dockerStatus =
          (await docker.getContainer(container.docker_runtime_id).inspect())
            .State.Status;
        container.docker_status = dockerStatus;
      } catch (e) {
        container.docker_status = 'not exist';
      }
    }

    return container;
  }

  async changeEnvs(input: {
    key: string;
    value: string;
  }[]) {
    await this.checkActionAccess(resources.container.actions.edit);
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

  async changeVariables(input: Partial<ContainerVariableTable>[]) {
    await this.checkActionAccess(resources.container.actions.edit);
    await knex<ContainerVariableTable>('container_variable').delete().where(
      'container_id',
      this.id,
    );
    for (let i in input) {
      await knex<ContainerVariableTable>('container_variable').insert({
        container_id: this.id,
        ...input[i],
      });
    }
  }

  shellCommand(
    command: string,
  ): { id: string; output: Promise<{ stdout: string; stderr: string }> } {
    const commandId = uuidv4();
    return {
      id: commandId,
      output: (async () => {
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
      })(),
    };
  }

  async getInstance(): Promise<Instance> {
    const data = await this.getData();
    return new Instance(this.ctx, data.app_instance_id);
  }

  async getImage(): Promise<Image> {
    const data = await this.getData();
    return new Image(this.ctx, data.image_id);
  }

  async updateDockerRuntimeId(id: string): Promise<void> {
    await this.edit({ docker_runtime_id: id });
  }

  async getEnvs(): Promise<ContainerEnvOptionTable[]> {
    return this.getContainerEnvOptions();
  }

  async getVariables(): Promise<ContainerVariableTable[]> {
    await this.checkActionAccess(resources.container.actions.read);
    return knex<ContainerVariableTable>('container_variable').select('*').where(
      'container_id',
      this.id,
    );
  }

  async getVolumes(): Promise< { containerVolume: ContainerVolumeTable; volume: Volume }[] > {
    await this.checkActionAccess(resources.container.actions.read);
    const containerVolumes = await new Volume(this.ctx).getVolumesOfContainer(this.id);
    return containerVolumes.map((containerVolume) => ({
      containerVolume,
      volume: new Volume(this.ctx, containerVolume.volume_id),
    }));
  }

  async getDbs(): Promise<ContainerDbTable[]> {
    await this.checkActionAccess(resources.container.actions.read);
    return new ContainerDb(this.ctx).getByFields({ container_id: this.id });
  }

  async getDockerLog(): Promise<string> {
    await this.checkActionAccess(resources.container.actions.read);
    const data = await this.getData();
    return new MegapolosNode(this.ctx, data.node_id).getDockerContainerLog(data.id);
  }

  async listFiles(
    path: string,
  ): Promise<{ files: string[]; directories: string[] }> {
    await this.checkActionAccess(resources.container.actions.read);
    const output = await this.shellCommand(`ls -p ${path}`).output;
    const files: string[] = [];
    const directories: string[] = [];
    output.stdout.split('\n').forEach((line) => {
      if (line === '') {
        return;
      }
      if (line.endsWith('/')) {
        directories.push(
          (path === '/' ? path : path + '/') + line.slice(0, -1),
        );
      } else {
        files.push((path === '/' ? path : path + '/') + line);
      }
    });
    return { files, directories };
  }

  async showFile(path: string): Promise<string> {
    await this.checkActionAccess(resources.container.actions.read);
    const output = await this.shellCommand(`cat ${path}`).output;
    return output.stdout;
  }

  async getContainerEnvOptions(): Promise<ContainerEnvOptionTable[]> {
    await this.checkActionAccess(resources.container.actions.read);
    return knex<ContainerEnvOptionTable>('container_env_option')
      .select('container_env_option.*')
      .where('container_env_option.container_id', this.id);
  }

  async addContainerEnvOption(input: Partial<ContainerEnvOptionTable>) {
    await this.checkActionAccess(resources.container.actions.edit);
    await knex<ContainerEnvOptionTable>('container_env_option').insert({
      container_id: this.id,
      ...input,
    });
  }

  async removeContainerEnvOptions() {
    await this.checkActionAccess(resources.container.actions.edit);
    await knex<ContainerEnvOptionTable>('container_env_option').delete().where(
      'container_id',
      this.id,
    );
  }

  async getDomain(): Promise<DomainTable | null> {
    await this.checkActionAccess(resources.container.actions.read);
    const data = await this.getData();
    if (!data.domain_id) {
      return null;
    }
    return new Domain(this.ctx, data.domain_id).getData();
  }

  async getRuntimeVariables(
    withoutInstance: boolean = false,
  ): Promise<ContainerRuntimeVariables> {
    await this.checkActionAccess(resources.container.actions.read);
    const domain = await this.getDomain();
    const volumes = await this.getVolumes();
    const variables = await this.getVariables();
    const dbs = await this.getDbs();

    const result: ContainerRuntimeVariables = {
      variables: {},
      dbs: {},
      volumes: {},
      domain: domain ? domain.name : null,
    };

    volumes.forEach((volume) => {
      result.volumes[volume.containerVolume.name] = {
        innerPath: volume.containerVolume.inner_path,
      };
    });

    variables.forEach((variable) => {
      result.variables[variable.name] = variable.value;
    });

    for (let i in dbs) {
      const dbContainer = dbs[i];
      const db = new Db(this.ctx, dbContainer.db_id);
      const dbData = await db.getData();
      const dbmsData = await db.getDbms();
      const dbUser = new DbUser(this.ctx, dbContainer.db_user_id);
      const dbUserData = await dbUser.getData();
      result.dbs[dbContainer.name] = {
        db: dbData.name,
        host: dbmsData.host,
        user: dbUserData.name,
        password: dbUserData.password,
      };
    }

    if (!withoutInstance) {
      result.instance = await (await this.getInstance()).getRuntimeVariables();
    }

    return result;
  }

  async addDb(
    dbId: string,
    dbUserId: string,
    name: string,
  ): Promise<ContainerDbTable> {
    await this.checkActionAccess(resources.container.actions.edit);
    return new ContainerDb(this.ctx).create({
      container_id: this.id,
      db_id: dbId,
      db_user_id: dbUserId,
      name,
    });
  }

  async removeDb(id: string): Promise<boolean> {
    await this.checkActionAccess(resources.container.actions.edit);
    return new ContainerDb(this.ctx, id).delete();
  }

  async _updateLifeStatus(status: string): Promise<void> {
    await this.edit({ life_status: status });
  }
}

export default Container;
