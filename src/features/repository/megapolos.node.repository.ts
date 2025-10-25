import { spawn } from 'child_process';
import dns from 'dns';
import { v4 as uuidv4 } from 'uuid';
import EventsObserver from '../events/eventsObserver';
import Process from '../process/Process';
import BaseProcess from '../process/BaseProcess';
import docker from '../docker/coreDocker';
import { megapolosPath } from '../../..';
import {
  AppInstanceTable,
  ContainerTable,
  DomainTable,
  ImageTable,
  LogType,
} from '../db/tables';
import { knex } from '../db/knex';
import config from '../../domain/config/config';
import fse from 'fs-extra';
import Docker from 'dockerode';
import ExternalProcess from '../process/ExternalProcess';
import jp from 'jsonpath';
import DockerEvent from '../events/docker.event';
import BaseRepo from './base.repository';
import { Node } from '../../domain/entities/Node.entity';
import {
  ContainerRepo,
  ContainerRuntimeVariables,
} from './cantainer/container.repository';
import ImageRepo from './image.repository';
import LogRepo from './log.repository';
import UserRepo from './user/user.repository';
import { Container } from '../../domain/entities/Container.entity';
import DockerRegistryRepo from './docker.registry.repository';
import { NodeSystemInfo } from '../../api/graphql/resolvers/node.resolver';
import { makeEm } from '../db/mikro-orm';
import { SystemInfoCollector } from '../system/SystemInfoCollector';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function asyncSpawn(
  command: string,
  onoutput,
  onerror
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell: 'bash',
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (data) => {
      stdout += data.toString();
      onoutput(data.toString());
    });
    child.stderr.on('data', (data) => {
      stderr += data.toString();
      onerror(data.toString());
    });
    child.on('close', (code) => {
      if (code) {
        reject({
          stdout,
          stderr,
          code,
        });
      } else {
        resolve({
          stdout,
          stderr,
          code,
        });
      }
    });
  });
}

async function lookupPromise(domain: string) {
  return new Promise<string>((resolve, reject) => {
    dns.lookup(domain, (err, address) => {
      if (err) reject(err);
      resolve(address);
    });
  });
}

export default class NodeRepo extends BaseRepo<Node> {
  get entityClass() {
    return Node;
  }

  commands: { [key: string]: BaseProcess } = {};

  static currentNode: NodeRepo;

  static createCurrentNode() {
    NodeRepo.currentNode = new NodeRepo(undefined);
  }

  async updateNode(init?: boolean, withRebuild?: boolean) {
    const data = await this.getEntity();
    if (data.lifeStatus === 'updating') {
      throw new Error('Node is updating');
    }
    const result: any = {
      containers: [],
      volumes: [],
      host: data.host,
      node: data,
    };
    const containers: ContainerTable[] = await knex('container').where({
      node_id: this.id,
    });

    const builded = [];
    for (let i in containers) {
      const containerResult: any = {};
      const container = containers[i];
      const containerObject = new ContainerRepo(this.ctx, container.id);
      const image: ImageTable = await knex('image')
        .where({ id: container.image_id })
        .first();
      if (withRebuild) {
        if (!builded.includes(image.id)) {
          const imageObject = new ImageRepo(this.ctx, image.id);
          await imageObject.build();
          builded.push(image.id);
        }
      }
      const instance: AppInstanceTable = await knex('app_instance')
        .where({ id: container.app_instance_id })
        .first();
      let domain: DomainTable;
      if (container.domain_id) {
        domain = await knex('domain')
          .where({ id: container.domain_id })
          .first();
      }
      const envs = await containerObject.getEnvs();
      const runtimeVariables: ContainerRuntimeVariables =
        await containerObject.getRuntimeVariables();

      const volumes = await containerObject.getVolumes();
      containerResult.auth = '';
      if (domain && domain.user) {
        containerResult.auth_user = domain.user;
        containerResult.auth_password = domain.password;
      }
      containerResult.name = instance.name + '_' + container.name;
      containerResult.description = container.id;

      const defaultDockerRegistry = await new DockerRegistryRepo().getDefault();
      containerResult.image = image.repository_id
        ? `${defaultDockerRegistry.host}:443/${image.image}`
        : image.image;
      if (config.devMode) {
        containerResult.image = image.image;
      }
      containerResult.inner_port = image.inner_port;
      containerResult.outer_port = container.outer_port;
      containerResult.envs = [];
      containerResult.domain_name = domain ? domain.name : null;
      containerResult.auth = domain ? domain.auth : '';
      containerResult.disabled = container.life_status !== 'running';

      for (let j in envs) {
        let env = envs[j];
        env.containerEnvValue = env.containerEnvValue.replace(
          /\{[a-zA-Z0-9_.]+\}/,
          (match) => {
            const path = match.substring(1, match.length - 1);
            const value = jp.value(runtimeVariables, path);
            if (value) {
              return value;
            }
            return '';
          }
        );
        containerResult.envs.push({
          name: env.containerEnvName,
          value: env.containerEnvValue,
        });
      }
      console.log(envs);
      containerResult.envs.push({
        name: 'MEGAPOLOS_LAST_BUILD_DATE',
        value: image.last_build_date
          ? new Date(image.last_build_date).toISOString()
          : '',
      });
      containerResult.volumes = [];
      for (let j in volumes) {
        let volume = volumes[j];
        containerResult.volumes.push({
          source: (await volume.volume.getEntity()).outerPath,
          target: volume.containerVolume.innerPath,
        });
        result.volumes.push((await volume.volume.getEntity()).outerPath);
      }
      result.containers.push(containerResult);
      result.init = init;
      const currentContainer = await containerObject.getEntity();
      if (currentContainer.lifeStatus === 'running') {
        const currentDate = new Date();
        await containerObject.update({ uptime: currentDate });
      }
    }
    const log = new LogRepo(this.ctx);
    await log.create({
      name: 'Update node ' + data.name,
      nodeId: this.id,
      nodeName: data.name,
      type: LogType.NodeUpdate,
    });

    let ansiblePath = `${megapolosPath}/ansible/deploy_swarm.yml`;
    if (config.devMode) {
      ansiblePath = `${megapolosPath}/ansible/deploy_swarm_dev_mode.yml`;
    }
    if (config.devMode) {
      result.dev_mode = true;
    }
    await this.runAnsible(ansiblePath, result, log);
  }

  async init() {
    if (config.devMode) {
      return;
    }
    const data = await this.getEntity();
    const log = new LogRepo(this.ctx);
    await log.create({
      name: 'Init node ' + data.name,
      nodeId: this.id,
      nodeName: data.name,
      type: LogType.NodeInit,
    });
    this.runAnsible(`${megapolosPath}/ansible/init.yml`, {}, log);
  }

  async prepareForCore() {
    if (config.devMode) {
      return;
    }
    const data = await this.getEntity();
    const log = new LogRepo(this.ctx);
    await log.create({
      name: 'Prepare for core node ' + data.name,
      nodeId: this.id,
      nodeName: data.name,
      type: LogType.NodePrepareForCore,
    });
    this.runAnsible(`${megapolosPath}/ansible/core.yml`, {}, log);
  }

  async installRegistry() {
    if (config.devMode) {
      return;
    }
    const data = await this.getEntity();
    const log = new LogRepo(this.ctx);
    await log.create({
      name: 'Install registry on node ' + data.name,
      nodeId: this.id,
      nodeName: data.name,
      type: LogType.NodeInstallRegistry,
    });

    const defaultDockerRegistry = await new DockerRegistryRepo().getDefault();

    this.runAnsible(
      `${megapolosPath}/ansible/registry.yml`,
      {
        registry_domain: defaultDockerRegistry.host,
        registry_user: defaultDockerRegistry.user,
        registry_password: defaultDockerRegistry.password,
      },
      log
    );
  }

  async runAnsible(playbook: string, data: any, log?: LogRepo) {
    const node = await this.getEntity();
    data.node = node;
    const jsonPath = megapolosPath + `/ansible/${uuidv4()}.json`;
    await fse.writeFile(jsonPath, JSON.stringify(data, null, 2));

    const defaultDockerRegistry = await new DockerRegistryRepo().getDefault();

    let command = `MEGAPOLOS_DEBUG=${
      config.debug ? '1' : '0'
    } ANSIBLE_CONFIG=${megapolosPath}/ansible/ansible.cfg CI_REGISTRY=${
      defaultDockerRegistry.host
    }:443 CI_REGISTRY_USER='${
      defaultDockerRegistry.user
    }' CI_REGISTRY_PASSWORD='${
      defaultDockerRegistry.password
    }' ANSIBLE_PASSWORD='${
      node.password
    }' JSON_PATH=${jsonPath} ANSIBLE_SSH_COMMON_ARGS='-o UserKnownHostsFile=/dev/null' ansible-playbook -u ${
      node.user
    } -e ansible_ssh_password='{{ lookup("env", "ANSIBLE_PASSWORD") }}' -i ${
      node.host
    }, ${playbook}`;
    if (config.devMode) {
      command = `MEGAPOLOS_DEBUG=${
        config.debug ? '1' : '0'
      } JSON_PATH=${jsonPath} ansible-playbook ${playbook}`;
    }
    try {
      await this.update({ lifeStatus: 'updating' });
      await NodeRepo.currentNode.shellCommand(
        command,
        new UserRepo(this.ctx, data.user),
        log
      ).output;
      await this.update({ lifeStatus: 'running', lastUpdateDate: new Date() });
      await fse.unlink(jsonPath);
    } catch (e) {
      await this.update({ lifeStatus: 'running' });
      await fse.unlink(jsonPath);
      console.error(e);
    }
  }

  async getUsedPorts() {
    return (
      await new ContainerRepo(this.ctx).getByFields({ node: this.id })
    ).map((app) => app.outerPort);
  }

  async getPort() {
    const usedPorts = await this.getUsedPorts();
    for (let i = 10000; i < 20000; i++) {
      if (!usedPorts.includes(i)) {
        return i;
      }
    }
    throw new Error('No available port');
  }

  async checkPort(port: number) {
    const usedPorts = await this.getUsedPorts();
    if (usedPorts.includes(port)) {
      throw new Error('No available port');
    }
    return true;
  }

  getMegapolosPath() {
    return megapolosPath;
  }

  validatePath(path: string) {
    if (!path.startsWith(this.getMegapolosPath())) {
      throw new Error('Invalid path');
    }
  }

  async restoreContainers() {
    const containers = await new ContainerRepo(this.ctx).getAll();
    for (let i in containers) {
      const container = new ContainerRepo(this.ctx, containers[i].id);
      await container.restore();
    }

    EventsObserver.listener({ type: 'restoreContainers' });
  }

  async dockerEvents() {
    docker.getEvents({}, function (err, data) {
      if (err) {
        console.trace('Docker error', err.message);
      } else {
        data.on('data', function (chunk) {
          EventsObserver.listener<DockerEvent>({
            type: 'DockerEvent',
            data: JSON.parse(chunk.toString('utf8')),
          });
        });
      }
    });

    EventsObserver.listener({ type: 'dockerEvents' });
  }

  shellCommand(
    command: string,
    user: UserRepo,
    log?: LogRepo
  ): { id: string; output: Promise<{ stdout: string; stderr: string }> } {
    const commandId = uuidv4();
    return {
      id: commandId,
      output: (async () => {
        let process: BaseProcess;
        if (this.id) {
          process = new ExternalProcess(command, this);
        } else {
          process = new Process(command);
        }
        this.commands[commandId] = process;
        // const osUserId = (await (user.getData())).os_user_id;
        // if (!osUserId) {
        //   console.log(await (user.getData()));
        //   throw new Error('No os user id');
        // }
        process.onoutput = (data) => {
          EventsObserver.listener({ type: 'shellCommandOutput', data: data });
          if (log) {
            log.append(data);
          }
        };
        process.onerror = (data) => {
          EventsObserver.listener({ type: 'shellCommandError', data: data });
          if (log) {
            log.append(data);
          }
        };

        try {
          await process.start();
        } catch (e) {
          if (log) {
            await log.close();
          }
          throw e;
        }
        if (log) {
          await log.close();
        }

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

  async getContainers(): Promise<Container[]> {
    return new ContainerRepo(this.ctx).getByFields({ node: this.id });
  }

  async getDocker() {
    const data = await this.getEntity();
    if (config.devMode) {
      return docker;
    }
    const nodeDocker = new Docker({
      host: data.host,
      port: 5102,
      protocol: 'https',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from('megapolos:' + data.password).toString('base64'),
      },
    });
    return nodeDocker;
  }

  async getDockerContainers(): Promise<string[]> {
    const nodeDocker = await this.getDocker();
    const containers = await new Promise<string[]>((resolve, reject) => {
      nodeDocker.listServices((err, services) => {
        if (err) {
          reject(err);
        } else {
          console.log(JSON.stringify(services, null, 2));
          resolve(
            services
              .filter((c) => c.Spec.Mode.Replicated.Replicas > 0)
              .map((c) => JSON.stringify(c.Spec.Labels.megapolos_id))
          );
        }
      });
    });
    return containers;
  }

  async getDockerContainer(id: string): Promise<Docker.Container> {
    const nodeDocker = await this.getDocker();
    const containers = await new Promise<Docker.ContainerInfo[]>(
      (resolve, reject) => {
        nodeDocker.listContainers((err, nodeContainers) => {
          if (err) {
            reject(err);
          } else {
            resolve(nodeContainers);
          }
        });
      }
    );
    return nodeDocker.getContainer(
      containers.find((c) => c.Labels.megapolos_id === id).Id
    );
  }

  async getDockerContainerLog(id: string): Promise<string> {
    const container = await this.getDockerContainer(id);
    const log = (
      await container.logs({ stdout: true, stderr: true })
    ).toString();
    return log;
  }

  async getIp() {
    const data = await this.getEntity();
    return lookupPromise(data.host);
  }

  async getSystemInfo(): Promise<NodeSystemInfo[]> {
    const nodes = await makeEm().findAll(Node);
    const collector = new SystemInfoCollector();
    const results = await Promise.all(
      nodes.map(async (node) => {
        const info = await collector.collect({
          id: node.id,
          host: node.host,
          user: node.user,
          password: node.password,
        });
        return {
          nodeId: node.id,
          totalMemoryMb: info.totalMemoryMb,
          availableMemoryMb: info.availableMemoryMb,
          cpuCores: info.cpuCores,
          totalDiskGb: info.totalDiskGb,
          freeDiskGb: info.freeDiskGb,
        };
      })
    );

    return results;
  }
}
