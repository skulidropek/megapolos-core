import fsSync from 'fs';
import { v4 as uuidv4 } from 'uuid';
import docker from '../../docker/coreDocker';
import { knex } from '../../db/knex';
import EventsObserver from '../../events/eventsObserver';
import {
  ContainerEnvOptionTable,
  ContainerVariableTable,
} from '../../db/tables';
import ContainerProcess from '../../process/ContainerProcess';
import { InstanceRuntimeVariables } from '../app.instance.repository';
import { Device } from '../../../domain/entities/Device.entity';
import BaseRepo from '../base.repository';
import { Container } from '../../../domain/entities/Container.entity';
import { RequiredEntityData } from '@mikro-orm/core';
import { resources, ResourceType } from '../../rights/resources.list';
import NodeRepo from '../megapolos.node.repository';
import VolumeRepo from '../volume.repository';
import { ContainerVolume } from '../../../domain/entities/ContainerVolume.entity';
import ImageRepo from '../image.repository';
import ContainerDbRepo from './container.db.repository';
import AppInstanceRepo from '../app.instance.repository';
import { ContainerDb } from '../../../domain/entities/ContainerDb.entity';
import DomainRepo from '../domain.repository';
import { Domain } from '../../../domain/entities/Domain.entity';
import DbRepo from '../db/db.repository';
import DbUserRepo from '../db/db.user.repository';
import { ContainerVariable } from '../../../domain/entities/ContainerVariable.entity';
import { makeEm, mem } from '../../db/mikro-orm';
import { User } from '../../../domain/entities/User.entity';
import { ContainerEnvOption } from '../../../domain/entities/ContainerEnvOption.entity';

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

export type ContainerResult = Container & {
  volumes?: ContainerVolume[];
  envs?: { key: string; value: string }[];
  devices?: {
    device: Device;
    parameters: { key: string; value: string }[];
    env_parameters: { key: string; value: string }[];
  }[];
  dockerStatus?: string;
};

export class ContainerRepo extends BaseRepo<Container> {
  get entityClass() {
    return Container;
  }

  get resourceType(): ResourceType {
    return ResourceType.Container;
  }

  async create(
    data: RequiredEntityData<Container> & { node?: string }
  ): Promise<Container> {
    await this.checkActionAccess(resources.Container.actions.create);
    const node = new NodeRepo(this.ctx, data.node);
    let outerPort = await node.getPort();
    if (data.outerPort) {
      await node.checkPort(data.outerPort);
      outerPort = data.outerPort;
    }
    data.outerPort = outerPort;
    return super.create(data);
  }

  async getDockerContainer() {
    const data = await this.getEntity();
    const node = new NodeRepo(this.ctx, data.node.id);
    return node.getDockerContainer(this.id);
  }

  async start() {
    await this.checkActionAccess(resources.Container.actions.manage);
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
    await this.checkActionAccess(resources.Container.actions.manage);
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

  async getDockerService() {
    const data = await this.getEntity();
    const node = new NodeRepo(this.ctx, data.node.id);
    return node.getDockerService(this.id);
  }

  async restartSwarmService() {
    await this.checkActionAccess(resources.Container.actions.manage);
    try {
      const dockerService = await this.getDockerService();
      const info = await dockerService.inspect();
      const spec = { ...info.Spec };
      spec.TaskTemplate.ForceUpdate += 1;

      await dockerService.update({ version: info.Version.Index, ...spec });
    } catch (e) {
      console.trace(e);
      EventsObserver.listener({
        type: 'containerError',
        data: { containerId: this.id, error: e },
      });
      throw new Error(e);
    }
  }

  async update(
    data: RequiredEntityData<Container> & { nodeId?: string }
  ): Promise<boolean> {
    await this.checkActionAccess(resources.Container.actions.edit);
    const entity = await this.getEntity();
    if (data.outerPort) {
      if (data.outerPort !== entity.outerPort) {
        const node = new NodeRepo(this.ctx, data.nodeId || entity.node.id);
        await node.checkPort(data.outerPort);
      }
    }
    return super.update(data);
  }

  async delete(): Promise<boolean> {
    await this.checkActionAccess(resources.Container.actions.remove);
    const data = await this.getEntity();
    if (data.dockerRuntimeId) {
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
    const megapolosVolume =
      NodeRepo.currentNode.getMegapolosPath() + '/volumes/' + this.id;
    if (fsSync.existsSync(megapolosVolume)) {
      NodeRepo.currentNode.validatePath(megapolosVolume);
      // await fs.rmdir(megapolosVolume, { recursive: true });
    }

    const volumes = await new VolumeRepo(this.ctx).getVolumesOfContainer(
      this.id
    );
    for (let i in volumes) {
      const volume = volumes[i];
      await this.removeVolume(volume.id);
    }

    return super.delete();
  }

  async restore() {
    await this.checkActionAccess(resources.Container.actions.manage);
    const container = await this.getEntity();
    try {
      if (!container.dockerRuntimeId) {
        return;
      }
      const containerInfo = await (await this.getDockerContainer()).inspect();
      if (container.lifeStatus === 'running' && !containerInfo.State.Running) {
        await this.start();
      }
      if (container.lifeStatus === 'stopped' && containerInfo.State.Running) {
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
    const volumes = await new VolumeRepo(this.ctx).getVolumesOfContainer(
      this.id
    );
    const volumeContainer = volumes.find(
      (_volume) => _volume.id === containerVolumeId
    );
    if (!volumeContainer) {
      throw new Error('Volume not found');
    }
    if (volumeContainer.isDynamic) {
      const volumePath =
        NodeRepo.currentNode.getMegapolosPath() +
        '/volumes/' +
        this.id +
        '/' +
        volumeContainer.id;
      NodeRepo.currentNode.validatePath(volumePath);
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
    await new VolumeRepo(this.ctx).removeFromContainer(containerVolumeId);
  }

  async getDataWithDetails(): Promise<Container> {
    const container: Container & { dockerStatus?: string } =
      await makeEm().findOne(
        Container,
        { id: this.id },
        { populate: ['volumes', 'envs'] }
      );
    if (container.dockerRuntimeId) {
      try {
        const dockerStatus = (
          await docker.getContainer(container.dockerRuntimeId).inspect()
        ).State.Status;
        container.dockerStatus = dockerStatus;
      } catch (e) {
        container.dockerStatus = 'not exist';
      }
    }

    return container;
  }

  async getDockerStatus(): Promise<string> {
    const container = await this.getEntity();
    try {
      if (!container.dockerRuntimeId) {
        return null;
      }
      return (await docker.getContainer(container.dockerRuntimeId).inspect())
        .State.Status;
    } catch (e) {
      return 'not exist';
    }
  }

  async changeEnvs(
    input: {
      key: string;
      value: string;
    }[]
  ) {
    await this.checkActionAccess(resources.Container.actions.edit);
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

  async changeVariables(input: RequiredEntityData<ContainerVariable>[]) {
    await this.checkActionAccess(resources.Container.actions.edit);
    await makeEm().nativeDelete(ContainerVariable, { container: this.id });
    await makeEm().insertMany(ContainerVariable, input);
  }

  shellCommand(command: string): {
    id: string;
    output: Promise<{ stdout: string; stderr: string }>;
  } {
    const commandId = uuidv4();
    return {
      id: commandId,
      output: (async () => {
        const process = new ContainerProcess(command, this);
        NodeRepo.currentNode.commands[commandId] = process;
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

        return result;
      })(),
    };
  }

  async getInstance(): Promise<AppInstanceRepo> {
    const data = await this.getEntity();
    return new AppInstanceRepo(this.ctx, data.appInstance.id);
  }

  async getImage(): Promise<ImageRepo> {
    const data = await this.getEntity();
    return new ImageRepo(this.ctx, data.image.id);
  }

  async updateDockerRuntimeId(id: string): Promise<void> {
    await this.update({ dockerRuntimeId: id });
  }

  async getEnvs(): Promise<ContainerEnvOption[]> {
    await this.checkActionAccess(resources.Container.actions.read);
    return (
      await makeEm().findOneOrFail(
        Container,
        {
          id: this.id,
        },
        { populate: ['envs'] }
      )
    ).envs.getItems();
  }

  async getVariables(): Promise<ContainerVariableTable[]> {
    await this.checkActionAccess(resources.Container.actions.read);
    return knex<ContainerVariableTable>('container_variable')
      .select('*')
      .where('container_id', this.id);
  }

  async getVolumes(): Promise<
    { containerVolume: ContainerVolume; volume: VolumeRepo }[]
  > {
    await this.checkActionAccess(resources.Container.actions.read);
    const containerVolumes = await new VolumeRepo(
      this.ctx
    ).getVolumesOfContainer(this.id);
    return containerVolumes.map((containerVolume) => ({
      containerVolume,
      volume: new VolumeRepo(this.ctx, containerVolume.volume.id),
    }));
  }

  async getDbs(): Promise<ContainerDb[]> {
    await this.checkActionAccess(resources.Container.actions.read);
    return new ContainerDbRepo(this.ctx).getByFields({ container: this.id });
  }

  async getDockerLog(): Promise<string> {
    await this.checkActionAccess(resources.Container.actions.read);
    const data = await this.getEntity();
    return new NodeRepo(this.ctx, data.node.id).getDockerContainerLog(data.id);
  }

  async listFiles(
    path: string
  ): Promise<{ files: string[]; directories: string[] }> {
    await this.checkActionAccess(resources.Container.actions.read);
    const output = await this.shellCommand(`ls -p ${path}`).output;
    const files: string[] = [];
    const directories: string[] = [];
    output.stdout.split('\n').forEach((line) => {
      if (line === '') {
        return;
      }
      if (line.endsWith('/')) {
        directories.push(
          (path === '/' ? path : path + '/') + line.slice(0, -1)
        );
      } else {
        files.push((path === '/' ? path : path + '/') + line);
      }
    });
    return { files, directories };
  }

  async showFile(path: string): Promise<string> {
    await this.checkActionAccess(resources.Container.actions.read);
    const output = await this.shellCommand(`cat ${path}`).output;
    return output.stdout;
  }

  async addContainerEnvOption(input: Partial<ContainerEnvOptionTable>) {
    await this.checkActionAccess(resources.Container.actions.edit);
    const em = this._getEM();
    const created = em.create(ContainerEnvOption, {
      container: await this.getEntity(),
      containerEnvName: input.container_env_name,
      containerEnvValue: input.container_env_value,
    });
    await em.persistAndFlush(created);
  }

  async removeContainerEnvOptions() {
    await this.checkActionAccess(resources.Container.actions.edit);
    const data = await this.getEntity();
    const result = data.envs.removeAll();
    await this._getEM().persistAndFlush(data);
  }

  async getDomain(): Promise<Domain | null> {
    await this.checkActionAccess(resources.Container.actions.read);
    const data = await this.getEntity();
    if (!data.domain) {
      return null;
    }
    return new DomainRepo(this.ctx, data.domain.id).getEntity();
  }

  async getRuntimeVariables(
    withoutInstance: boolean = false
  ): Promise<ContainerRuntimeVariables> {
    await this.checkActionAccess(resources.Container.actions.read);
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
        innerPath: volume.containerVolume.innerPath,
      };
    });

    variables.forEach((variable) => {
      result.variables[variable.name] = variable.value;
    });

    for (let i in dbs) {
      const dbContainer = dbs[i];
      const db = new DbRepo(this.ctx, dbContainer.db.id);
      const dbData = await db.getEntity();
      const dbmsData = await db.getDbms();
      const dbUser = new DbUserRepo(this.ctx, dbContainer.dbUser.id);
      const dbUserData = await dbUser.getEntity();
      result.dbs[dbContainer.role] = {
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
    role: string
  ): Promise<ContainerDb> {
    await this.checkActionAccess(resources.Container.actions.edit);
    return new ContainerDbRepo(this.ctx).create({
      container: this.id,
      db: dbId,
      dbUser: dbUserId,
      role,
    });
  }

  async removeDbByContainerDbId(containerDbId: string): Promise<boolean> {
    await this.checkActionAccess(resources.Container.actions.edit);
    return new ContainerDbRepo(this.ctx, containerDbId).delete();
  }

  async _updateLifeStatus(status: string): Promise<void> {
    await this.update({ lifeStatus: status });
  }

  async updateShowOnDesktop(showOnDesktop: boolean): Promise<void> {
    await this.checkActionAccess(resources.Container.actions.edit);
    await this.update({ showOnDesktop });
  }
}
