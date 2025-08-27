import fse from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { megapolosPath } from '../../..';
import { knex } from '../db/knex';
import {
  ImageEnvRequirementTable,
  ImageStatus,
  ImageVariableRequirementTable,
  LogType,
} from '../db/tables';
import { resources, ResourceType } from '../rights/resources.list';
import AppRepo from './app.repository';
import BaseRepo from './base.repository';
import { ContainerRepo } from './cantainer/container.repository';
import LogRepo from './log.repository';
import RepositoryRepo from './repository.repository';
import UserRepo from './user/user.repository';
import config from '../../domain/config/config';
import { Image } from '../../domain/entities/Image.entity';
import { makeEm } from '../db/mikro-orm';
import { Log } from '../../domain/entities/Log.entity';
import NodeRepo from './megapolos.node.repository';
import { ImageEnvRequirement } from '../../domain/entities/ImageEnvRequirement.entity';
import { ImageEnvRequirementInput } from '../../api/graphql/resolvers/image.resolver';
import Docker from 'dockerode';

export default class ImageRepo extends BaseRepo<Image> {
  private docker = new Docker();

  get entityClass() {
    return Image;
  }

  get resourceType(): ResourceType {
    return ResourceType.Image;
  }

  // TODO: rewrite via dockerode (dockerCore)
  async build() {
    await this.checkActionAccess(resources.image.actions.build);
    this.ctx = this.ctx.cloneNoRightsCheck();
    const data = await this.getEntity();
    if (!data.repository?.id) {
      const log = new LogRepo(this.ctx);
      await log.create({
        name: `Build failed for image ${data.name}: repository ID is missing`,
        objectId: this.id,
        objectName: data.name,
        type: LogType.ImageBuild,
      });
      return;
    }
    const path = megapolosPath + '/data/' + uuidv4();
    if (!(await fse.exists(path))) {
      await fse.mkdir(path);
    }
    const repository = new RepositoryRepo(this.ctx, data.repository.id);
    await repository.fetch();
    await repository.copyBranchTo(path, data.branch);
    console.log(data);
    if (data.repository.id) {
      await this.update({ status: ImageStatus.Building });
      try {
        const log = new LogRepo(this.ctx);
        await log.create({
          name: 'Build image ' + data.name,
          objectId: this.id,
          objectName: data.name,
          type: LogType.ImageBuild,
        });

        let tags = `-t ${data.image} -t ${config.registryHost}:443/${data.image}`;
        if (config.devMode) {
          tags = `-t ${data.image}`;
        }

        const result = await NodeRepo.currentNode.shellCommand(
          `cd ${path} && docker build ${tags} .`,
          new UserRepo(this.ctx),
          log
        ).output;
        if (!config.devMode) {
          await NodeRepo.currentNode.shellCommand(
            `docker login -u '${config.registryUser}' -p '${config.registryPassword}' ${config.registryHost}:443`,
            new UserRepo(this.ctx, this.ctx.user.id),
            log
          ).output;
          await NodeRepo.currentNode.shellCommand(
            `docker push ${config.registryHost}:443/${data.image}`,
            new UserRepo(this.ctx, this.ctx.user.id),
            log
          ).output;
          await NodeRepo.currentNode.shellCommand(
            'docker image prune -f',
            new UserRepo(this.ctx, this.ctx.user.id),
            log
          ).output;
        }
        await this.update({
          status: ImageStatus.Built,
          lastBuildDate: new Date(),
        });
        console.log(result);
        if (await fse.exists(path)) {
          await fse.remove(path);
        }
      } catch (error) {
        await this.update({ status: ImageStatus.NotExist });
        console.error(error);
        if (await fse.exists(path)) {
          await fse.remove(path);
        }
      }
    }
  }

  // TODO -> dockerCore
  async deleteDockerImage(): Promise<void> {
    await this.checkActionAccess(resources.image.actions.remove);
    const data = await this.getEntity();
    if (!data.image) {
      throw new Error(
        'Image name is empty when trying to delete Docker image!'
      );
    }

    const logRepo = new LogRepo(this.ctx);
    const deletionLog = await logRepo.create({
      name: 'Delete docker image ' + data.name,
      objectId: this.id,
      objectName: data.name,
      type: LogType.ImageDelete,
    });

    logRepo.id = deletionLog.id;

    try {
      const image = this.docker.getImage(data.image);
      await image.remove();
      await logRepo.append(`Docker image ${data.image} deleted successfully.`);
      await this.update({ status: ImageStatus.NotExist });
    } catch (error) {
      //TODO - format error
      await logRepo.append(`Failed to delete Docker image: ${error}`);
      throw error;
    }
  }

  async getAppRepo(): Promise<AppRepo> {
    const data = await this.getEntity();
    return new AppRepo(this.ctx, data.app.id);
  }

  async updateNodes(): Promise<void> {
    await this.checkActionAccess(resources.image.actions.update_nodes);
    const containers = await new ContainerRepo(this.ctx).getByFields({
      image: this.id,
    });
    const nodes: string[] = [];
    for (let i in containers) {
      const container = containers[i];
      if (container.node?.id && !nodes.includes(container.node.id)) {
        nodes.push(container.node.id);
        await new NodeRepo(this.ctx, container.node.id).updateNode();
      }
    }
    console.log(nodes);
  }

  async changeEnvs(
    envs: (typeof ImageEnvRequirementInput)[]
  ): Promise<boolean> {
    await this.checkActionAccess(resources.image.actions.edit);
    const em = makeEm();
    await em.nativeDelete(ImageEnvRequirement, { image: this.id });
    await em.insertMany(
      ImageEnvRequirement,
      envs.map((env) => ({ ...env, image: this.id }))
    );

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

  async getEnvs(): Promise<ImageEnvRequirement[]> {
    await this.checkActionAccess(resources.image.actions.read);
    return (
      await makeEm().findOneOrFail(
        Image,
        {
          id: this.id,
        },
        { populate: ['envs'] }
      )
    ).envs.getItems();
  }

  async getVariables(): Promise<ImageVariableRequirementTable[]> {
    await this.checkActionAccess(resources.image.actions.read);
    return knex('image_variable_requirement').where({ image_id: this.id });
  }

  async getLastBuildLog(): Promise<Log> {
    await this.checkActionAccess(resources.image.actions.read);
    return (
      await makeEm().find(
        Log,
        {
          objectId: this.id,
          type: LogType.ImageBuild,
        },
        { limit: 1, orderBy: { createDate: 'desc' } }
      )
    )[0];
  }
}
