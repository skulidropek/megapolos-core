import { v4 as uuidv4 } from 'uuid';
import fse from 'fs-extra';
import { ContainerTable, ImageEnvRequirementTable, ImageStatus, ImageTable, ImageVariableRequirementTable, LogTable, LogType } from '../modules/models/tables';
import App from './App';
import docker from '../coreDocker';
import { megapolosPath } from '..';
import Repository from './Repository';
import MegapolosNode from './Node';
import User from './User';
import config from '../config/config';
import Log from './Log';
import { knex } from '../corePostgres';
import BaseRepository from './BaseRepository';
import Container from './Container';

class Image extends BaseRepository<ImageTable> {
  getTable(): string {
    return 'image';
  }

  async build(userId: string) {
    const data = await this.getData();
    if (!data.repository_id) {
      return;
    }
    const path = megapolosPath + '/data/' + uuidv4();
    if (!await fse.exists(path)) {
      await fse.mkdir(path);
    }
    const repository = new Repository(data.repository_id);
    await repository.fetch();
    await repository.copyBranchTo(path, data.branch);
    console.log(data);
    if (data.repository_id) {
      await this.edit({ status: ImageStatus.Building });
      try {
        const log = new Log();
        await log.create({ 
          name: 'Build image ' + data.name,
          object_id: this.id,
          object_name: data.name,
          type: LogType.ImageBuild,
        });

        let tags = `-t ${data.image} -t ${config.registryHost}:443/${data.image}`;
        if (config.devMode) {
          tags = `-t ${data.image}`;
        }
    
        const result = await MegapolosNode.currentNode.shellCommand(
          `cd ${path} && docker build ${tags} .`, new User(userId), log).output;
        if (!config.devMode) {
          await MegapolosNode.currentNode.shellCommand(`docker login -u '${config.registryUser}' -p '${config.registryPassword}' ${config.registryHost}:443`, new User(userId), log).output;
          await MegapolosNode.currentNode.shellCommand(`docker push ${config.registryHost}:443/${data.image}`, new User(userId), log).output;
        }
        await this.edit({ status: ImageStatus.Built, last_build_date: new Date() });
        console.log(result);
        if (await fse.exists(path)) {
          await fse.remove(path);
        }    
      } catch (error) {
        await this.edit({ status: ImageStatus.NotExist });
        console.error(error);
        if (await fse.exists(path)) {
          await fse.remove(path);
        }
      }
    }
  }  

  async getApp(): Promise<App> {
    const data = await this.getData();
    return new App(data.app_id);
  }
  
  async updateNodes(): Promise<void> {
    const containers = await new Container().getByFields({ image_id: this.id });
    const nodes: string[] = [];
    for (let i in containers) {
      const container = containers[i];
      if (container.node_id && !nodes.includes(container.node_id)) {
        nodes.push(container.node_id);
        await new MegapolosNode(container.node_id).update();
      }
    }
    console.log(nodes);
  }

  async changeEnvs(envs: ImageEnvRequirementTable[]): Promise<boolean> {
    await knex('image_env_requirement').where({ image_id: this.id }).delete();
    for (let i in envs) {
      const env = envs[i];
      delete env.id;
      env.image_id = this.id;
      await knex('image_env_requirement').insert(env);
    }
    return true;
  }

  async changeVariables(variables: ImageVariableRequirementTable[]): Promise<boolean> {
    await knex('image_variable_requirement').where({ image_id: this.id }).delete();
    for (let i in variables) {
      const variable = variables[i];
      delete variable.id;
      variable.image_id = this.id;
      await knex('image_variable_requirement').insert(variable);
    }
    return true;
  }

  async getEnvs(): Promise<ImageEnvRequirementTable[]> {
    return knex('image_env_requirement').where({ image_id: this.id });
  }

  async getVariables(): Promise<ImageVariableRequirementTable[]> {
    return knex('image_variable_requirement').where({ image_id: this.id });
  }

  async getLastBuildLog(): Promise<LogTable> {
    return (await new Log().getByQuery(_knex => 
      _knex.where({ object_id: this.id, type: LogType.ImageBuild }).orderBy('create_date', 'desc').limit(1)))[0];
  }

}

export default Image;