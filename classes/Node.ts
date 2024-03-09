import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import EventsObserver from '../modules/events/eventsObserver';
import User from './User';
import Process from './Process';
import BaseProcess from './BaseProcess';
import AppInstanceModel from '../modules/models/appInstance.model';
import Container from './Container';
import docker from '../coreDocker';
import DockerEvent from '../modules/events/docker.event';
import { megapolosPath } from '..';
import { AppInstanceTable, ContainerTable, DomainTable, ImageTable, NodeTable } from '../modules/models/tables';
import Entity from '../modules/models/Entity';
import { knex } from '../coreRqlite';
import config from '../config/config.json';
import fse from 'fs-extra';
import Docker from 'dockerode';

function asyncSpawn(command:string, onoutput, onerror): Promise<{ stdout: string, stderr: string, code: number }> {
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
          code });
      }
    });
  });
}

class MegapolosNode {

  commands: { [key: string]: BaseProcess } = {};

  static currentNode: MegapolosNode;

  id: string;

  static createCurrentNode() {
    MegapolosNode.currentNode = new MegapolosNode();
  }

  static async createNode(data: Partial<NodeTable>): Promise<MegapolosNode> {
    const entity = new Entity<NodeTable>('node');
    const result = await entity.create(data);
    return new MegapolosNode(result.id);
  }

  static async getNodesData(): Promise<NodeTable[]> {
    const entity = new Entity<NodeTable>('node');
    return entity.findAll();
  }

  static async getNodes(): Promise<MegapolosNode[]> {
    const nodes = await MegapolosNode.getNodesData();
    return nodes.map((node) => new MegapolosNode(node.id));
  }

  constructor(id?: string) {
    if (id) {
      this.id = id;
    }
  }

  edit(data: Partial<NodeTable>) {
    const entity = new Entity<NodeTable>('node');
    return entity.update({ id: this.id }, data);
  }

  delete() {
    const entity = new Entity<NodeTable>('node');
    return entity.delete({ id: this.id });
  }

  getData() {
    const entity = new Entity<NodeTable>('node');
    return entity.findOne({ id: this.id });
  }

  async update() {
    const data = await this.getData();
    if (data.life_status === 'updating') {
      // throw new Error('Node is updating');
    }
    const result: any = {
      containers: [],
      volumes: [],
      host: data.host,
      node: data,
    };
    const containers:ContainerTable[] = await knex('container').where({ node_id: this.id });
    for (let i in containers) {
      const containerResult: any = {};
      const container = containers[i];
      const containerObject = new Container(container.id);
      const image:ImageTable = await knex('image').where({ id: container.image_id }).first();
      const instance:AppInstanceTable = await knex('app_instance').where({ id: container.app_instance_id }).first();
      let domain:DomainTable;
      if (container.domain_id) {
        domain = await knex('domain').where({ id: container.domain_id }).first();
      }
      const envs = await containerObject.getEnvs();
      const volumes = await containerObject.getVolumes();
      containerResult.auth = '';
      containerResult.name = instance.name + '_' + container.name;
      containerResult.description = container.id;
      containerResult.image = image.repository_id ? `${config.registryHost}/${image.image}` : image.image;
      containerResult.inner_port = image.inner_port;
      containerResult.outer_port = container.outer_port;
      containerResult.envs = [];
      containerResult.domain_name = domain ? domain.name : null;
      containerResult.auth = domain ? domain.auth : '';
      containerResult.disabled = container.life_status !== 'running';
      
      for (let i in envs) {
        let env = envs[i];
        containerResult.envs.push({ name: env.container_env_name, value: env.container_env_value });
      }
      containerResult.volumes = [];
      for (let i in volumes) {
        let volume = volumes[i];
        containerResult.volumes.push({ source: (await volume.volume.getData()).outer_path, target: volume.containerVolume.inner_path });
        result.volumes.push((await volume.volume.getData()).outer_path);
      }
      result.containers.push(containerResult);
    }
    console.log(JSON.stringify(result, null, 2));
    const jsonPath = megapolosPath + `/ansible/${data.name}.json`;
    await fse.writeFile(jsonPath, JSON.stringify(result, null, 2));
    const command = `ANSIBLE_CONFIG=${megapolosPath}/ansible/ansible.cfg CI_REGISTRY=${config.registryHost} CI_REGISTRY_USER='${config.registryUser}' CI_REGISTRY_PASSWORD='${config.registryPassword}' ANSIBLE_PASSWORD='${data.password}' JSON_PATH=${jsonPath} ANSIBLE_SSH_COMMON_ARGS='-o UserKnownHostsFile=/dev/null' ansible-playbook -u ${data.user} -e ansible_ssh_password='{{ lookup("env", "ANSIBLE_PASSWORD") }}' --extra-vars "hosts=${data.host}" ${megapolosPath}/ansible/deploy_swarm.yml`;
    console.log(command);
    const entity = new Entity<NodeTable>('node');
    await entity.update({ id: this.id }, { life_status: 'updating' });
    MegapolosNode.currentNode.shellCommand(command, new User(data.user)).output.then(async () => {
      await entity.update({ id: this.id }, { life_status: 'running', last_update_date: new Date() });
      await fse.unlink(jsonPath);
    }).catch(async (e) => {
      await fse.unlink(jsonPath);
      await entity.update({ id: this.id }, { life_status: 'running' });
      throw e;
    });
  }

  async getPort() {
    const usedPorts = (await AppInstanceModel.getUsedPorts()).map((app) => app.outer_port);
    for (let i = 10000; i < 20000; i++) {
      if (!usedPorts.includes(i)) {
        return i;
      }
    }
    throw new Error('No available port');
  }

  async checkPort(port: number) {
    const usedPorts = (await AppInstanceModel.getUsedPorts()).map((app) => app.outer_port);
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
    const containers = await AppInstanceModel.getContainers();
    for (let i in containers) {
      const container = new Container(containers[i].id);
      await container.restore();
    }

    EventsObserver.listener({ 'type': 'restoreContainers' });
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

    EventsObserver.listener({ 'type': 'dockerEvents' });
  }
  
  shellCommand(command: string, user: User): { id: string, output: Promise<{ stdout: string, stderr: string }> } {
    const commandId = uuidv4();
    return { id: commandId, output: (async () => {
      const process = new Process(command, user);
      this.commands[commandId] = process;
      // const osUserId = (await (user.getData())).os_user_id;
      // if (!osUserId) {
      //   console.log(await (user.getData()));
      //   throw new Error('No os user id');
      // }
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

  async getContainers(): Promise<ContainerTable[]> {
    return new Entity<ContainerTable>('container').findAll({ node_id: this.id });
  }

  async getDocker() {
    const data = await this.getData();
    const docker = new Docker({
      host: data.host,
      port: 5102,
      protocol: 'https',
      headers: {
        'Authorization': 'Basic ' + Buffer.from('megapolos:' + data.password).toString('base64'),
      },
    });
    return docker;
  }

  async getDockerContainers(): Promise<string[]> {
    const docker = await this.getDocker();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const containers = await new Promise<string[]>((resolve, reject) => {
      docker.listServices((err, services) => {
        if (err) {
          reject(err);
        } else {
          console.log(JSON.stringify(services, null, 2));
          resolve(services.filter(c => c.Spec.Mode.Replicated.Replicas > 0).
            map(c => JSON.stringify(c.Spec.Labels.megapolos_id)));
        }
      });
    });
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    return containers;
  }

  async getDockerContainerLog(id: string): Promise<string> {
    const docker = await this.getDocker();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const containers = await new Promise<Docker.ContainerInfo[]>((resolve, reject) => {
      docker.listContainers((err, containers) => {
        if (err) {
          reject(err);
        } else {
          resolve(containers);
        }
      });
    });
    const container = containers.find(c => c.Labels.megapolos_id === id);
    const log = (await docker.getContainer(container.Id).logs({ stdout: true, stderr: true })).toString();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    return log;
  }
}

export default MegapolosNode;