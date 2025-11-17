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
import {
  defaultRights,
  resources,
  ResourceType,
  UserAction,
} from '../rights/resources.list';
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
import docker from '../docker/coreDocker';
import DockerRegistryRepo from './docker.registry.repository';
import { RightsChecker } from '../rights/RightsChecker';

export default class ImageRepo extends BaseRepo<Image> {
  get entityClass() {
    return Image;
  }

  get resourceType(): ResourceType {
    return ResourceType.Image;
  }

  async build() {
    await this.checkAppAccess(
      resources.App.actions.build_images,
      resources.Image.actions.build
    );
    this.ctx = this.ctx.cloneNoRightsCheck();

    const data = await this.getEntity();

    const path = megapolosPath + '/data/' + uuidv4();

    if (data.repository.id) {
      await this.update({ status: ImageStatus.Building });
      try {
        const log = new LogRepo(this.ctx);
        await log.create({
          name: 'Build image ' + data.name,
          objectId: this.id,
          objectName: data.name,
          objectType: ResourceType.Image,
          type: LogType.ImageBuild,
          objectMeta: { appId: data.app.id },
        });

        // console.log(data);
        // await log.appendLine('Image data:');
        // await log.appendLine(JSON.stringify(data, null, 2));

        if (!data.repository?.id) {
          await log.append(
            `Build failed for image ${data.name}: repository ID is missing`
          );
          return;
        }

        if (!(await fse.exists(path))) {
          await fse.mkdir(path);
        }
        const repository = new RepositoryRepo(this.ctx, data.repository.id);
        await repository.fetch();
        if (data.commitId) {
          await repository.copyBranchWithCheckoutToCommit(
            path,
            data.branch,
            data.commitId
          );
        } else {
          await repository.copyBranchTo(path, data.branch);
        }

        const defaultDockerRegistry =
          await new DockerRegistryRepo().getDefault();

        let imageName = data.getImageVersionName();
        let tags = `-t ${imageName} -t ${defaultDockerRegistry.host}:443/${imageName}`;
        if (config.devMode) {
          tags = `-t ${imageName}`;
        }

        const result = await NodeRepo.currentNode.shellCommand(
          `cd ${path} && docker build ${tags} .`,
          new UserRepo(this.ctx),
          log,
          true
        ).output;
        if (!config.devMode) {
          await NodeRepo.currentNode.shellCommand(
            `docker login -u '${defaultDockerRegistry.user}' -p '${defaultDockerRegistry.password}' ${defaultDockerRegistry.host}:443`,
            new UserRepo(this.ctx, this.ctx.user.id),
            log,
            true
          ).output;
          await NodeRepo.currentNode.shellCommand(
            `docker push ${defaultDockerRegistry.host}:443/${imageName}`,
            new UserRepo(this.ctx, this.ctx.user.id),
            log,
            true
          ).output;
          await NodeRepo.currentNode.shellCommand(
            'docker image prune -f',
            new UserRepo(this.ctx, this.ctx.user.id),
            log,
            true
          ).output;
        }
        await log.close();
        await this.update({
          status: ImageStatus.Built,
          lastBuildDate: new Date(),
        });
        console.log(result);
      } catch (error) {
        await this.update({ status: ImageStatus.NotExist });
        console.error(error);
      } finally {
        if (await fse.exists(path)) {
          await fse.remove(path);
        }
      }
    }
  }

  async checkAppAccess(appAction: string, imageAction?: string) {
    if (imageAction && (await this.haveActionAccess(imageAction))) {
      return;
    }

    const image = await new ImageRepo(
      this.ctx.cloneNoRightsCheck(),
      this.id
    ).getEntity();

    const appRepo = new AppRepo(this.ctx, image.app.id);
    if (await appRepo.haveActionAccess(appAction)) {
      return;
    }

    this._throwAccessDenied();
  }

  async deleteDockerImage(): Promise<boolean> {
    await this.checkAppAccess(resources.App.actions.delete_docker_images);
    this.ctx = this.ctx.cloneNoRightsCheck();

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
      objectType: ResourceType.Image,
      type: LogType.ImageDelete,
      objectMeta: { appId: data.app.id },
    });

    logRepo.id = deletionLog.id;

    try {
      const image = docker.getImage(data.getImageVersionName());
      await image.remove();
      await logRepo.append(
        `Docker image ${data.getImageVersionName()} deleted successfully.`
      );
      await this.update({ status: ImageStatus.NotExist });
    } catch (error) {
      await logRepo.append(`Failed to delete Docker image`);
      await logRepo.appendLine(JSON.stringify(error, null, 2));
      throw error;
    } finally {
      await logRepo.close();
    }
    return true;
  }

  async getAppRepo(): Promise<AppRepo | null> {
    const data = await this.getEntity();
    if (!data.app?.id) return null;

    return new AppRepo(this.ctx, data.app.id);
  }

  async updateNodes(): Promise<void> {
    await this.checkAppAccess(
      resources.App.actions.build_images,
      resources.Image.actions.update_nodes
    );
    this.ctx = this.ctx.cloneNoRightsCheck();
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
    await this.checkActionAccess(resources.Image.actions.edit);
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
    await this.checkActionAccess(resources.Image.actions.edit);
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
    await this.checkActionAccess(resources.Image.actions.read);
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
    await this.checkActionAccess(resources.Image.actions.read);
    return knex('image_variable_requirement').where({ image_id: this.id });
  }

  async getLastBuildLog(): Promise<Log> {
    await this.checkActionAccess(resources.Image.actions.read);
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

  private _imageEntityToActions(image: Image): UserAction[] {
    const actions: UserAction[] = [];

    actions.push({
      resourceType: ResourceType.App,
      resourceId: image.app.id,
      action: defaultRights.read,
    });
    actions.push({
      resourceType: ResourceType.Image,
      resourceId: image.id,
      action: defaultRights.read,
    });
    return actions;
  }

  override async haveActionAccess(action: string): Promise<boolean> {
    if (action !== defaultRights.read) {
      return super.haveActionAccess(action);
    }

    if (
      this.ctx?.noRightsCheck ||
      !this.checkRights ||
      !this.ctx?.user ||
      this.ctx?.user?.groupUser.id == UserRepo.rootRoleId
    ) {
      return true;
    }

    const image = await makeEm().findOne(this.entityClass, {
      id: this.id,
    });

    return RightsChecker.checkByAction(
      this.ctx.user.id,
      image,
      this._imageEntityToActions
    );
  }

  override async filterEntitiesByAccess(images: Image[]): Promise<Image[]> {
    if (
      this.ctx?.noRightsCheck ||
      !this.ctx?.user ||
      this.ctx?.user?.groupUser.id == UserRepo.rootRoleId
    ) {
      return images;
    }

    return await RightsChecker.filterByAction(
      this.ctx.user.id,
      images,
      this._imageEntityToActions
    );
  }
}
