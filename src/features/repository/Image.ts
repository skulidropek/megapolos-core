import fse from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { megapolosPath } from '../../..';
import { knex } from '../db/knex';
import {
  ImageEnvRequirementTable,
  ImageStatus,
  ImageTable,
  ImageVariableRequirementTable,
  LogTable,
  LogType,
} from '../db/tables';
import { resources } from '../rights/resources_list';
import App from './App';
import BaseRepository from './BaseRepository';
import Container from './container/Container';
import Log from './Log';
import MegapolosNode from './Node';
import Repository from './Repository';
import User from './user/User';
import config from '../../domain/config/config';

class Image extends BaseRepository<ImageTable> {
  getTable(): string {
    return 'image';
  }

  async build() {
    await this.checkActionAccess(resources.image.actions.build);
    const data = await this.getData();
    if (!data.repository_id) {
      return;
    }
    const path = megapolosPath + '/data/' + uuidv4();
    if (!(await fse.exists(path))) {
      await fse.mkdir(path);
    }
    const repository = new Repository(this.ctx, data.repository_id);
    await repository.fetch();
    await repository.copyBranchTo(path, data.branch);
    console.log(data);
    if (data.repository_id) {
      await this.edit({ status: ImageStatus.Building });
      try {
        const log = new Log(this.ctx);
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
          `cd ${path} && docker build ${tags} .`,
          new User(this.ctx),
          log
        ).output;
        if (!config.devMode) {
          await MegapolosNode.currentNode.shellCommand(
            `docker login -u '${config.registryUser}' -p '${config.registryPassword}' ${config.registryHost}:443`,
            new User(this.ctx, this.ctx.user.id),
            log
          ).output;
          await MegapolosNode.currentNode.shellCommand(
            `docker push ${config.registryHost}:443/${data.image}`,
            new User(this.ctx, this.ctx.user.id),
            log
          ).output;
          await MegapolosNode.currentNode.shellCommand(
            'docker image prune -f',
            new User(this.ctx, this.ctx.user.id),
            log
          ).output;
        }
        await this.edit({
          status: ImageStatus.Built,
          last_build_date: new Date(),
        });
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
    return new App(this.ctx, data.app_id);
  }

  async updateNodes(): Promise<void> {
    await this.checkActionAccess(resources.image.actions.update_nodes);
    const containers = await new Container(this.ctx).getByFields({
      image_id: this.id,
    });
    const nodes: string[] = [];
    for (let i in containers) {
      const container = containers[i];
      if (container.node_id && !nodes.includes(container.node_id)) {
        nodes.push(container.node_id);
        await new MegapolosNode(this.ctx, container.node_id).update();
      }
    }
    console.log(nodes);
  }

  async changeEnvs(envs: ImageEnvRequirementTable[]): Promise<boolean> {
    await this.checkActionAccess(resources.image.actions.edit);
    await knex('image_env_requirement').where({ image_id: this.id }).delete();
    for (let i in envs) {
      const env = envs[i];
      delete env.id;
      env.image_id = this.id;
      await knex('image_env_requirement').insert(env);
    }
    return true;
  }

  async changeVariables(
    variables: ImageVariableRequirementTable[]
  ): Promise<boolean> {
    await this.checkActionAccess(resources.image.actions.edit);
    await knex('image_variable_requirement')
      .where({ image_id: this.id })
      .delete();
    for (let i in variables) {
      const variable = variables[i];
      delete variable.id;
      variable.image_id = this.id;
      await knex('image_variable_requirement').insert(variable);
    }
    return true;
  }

  async getEnvs(): Promise<ImageEnvRequirementTable[]> {
    await this.checkActionAccess(resources.image.actions.read);
    return knex('image_env_requirement').where({ image_id: this.id });
  }

  async getVariables(): Promise<ImageVariableRequirementTable[]> {
    await this.checkActionAccess(resources.image.actions.read);
    return knex('image_variable_requirement').where({ image_id: this.id });
  }

  async getLastBuildLog(): Promise<LogTable> {
    await this.checkActionAccess(resources.image.actions.read);
    return (
      await new Log(this.ctx).getByQuery((_knex) =>
        _knex
          .where({ object_id: this.id, type: LogType.ImageBuild })
          .orderBy('create_date', 'desc')
          .limit(1)
      )
    )[0];
  }
}

export default Image;
