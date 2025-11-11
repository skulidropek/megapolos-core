import EventsObserver from '../events/eventsObserver';
import { resources, ResourceType } from '../rights/resources.list';
import BaseRepo from './base.repository';
import { AppInstance } from '../../domain/entities/AppInstance.entity';
import UserRepo from './user/user.repository';
import UserGroupRepo from './user/user.group.repository';
import ImageRepo from './image.repository';
import { Image } from '../../domain/entities/Image.entity';
import {
  ContainerRepo,
  ContainerResult,
  ContainerRuntimeVariables,
} from './cantainer/container.repository';
import { RequiredEntityData } from '@mikro-orm/core';
import { Container } from '../../domain/entities/Container.entity';
import { makeEm } from '../db/mikro-orm';
import AppVersionRepo from './app.version.repository';
import {
  ConfiguratedContainerInput,
  InstanceDataInput,
} from '../../api/graphql/resolvers/instance.resolver';
import DomainRepo from './domain.repository';
import VolumeRepo from './volume.repository';
import DbRepo from './db/db.repository';
import ContainerDbRepo from './cantainer/container.db.repository';
import DbUserRepo from './db/db.user.repository';
import { ContainerVariable } from '../../domain/entities/ContainerVariable.entity';

export interface InstanceRuntimeVariables {
  containers: {
    [key: string]: ContainerRuntimeVariables;
  };
}

export interface AppInstanceResult extends AppInstance {
  containers?: ContainerResult[];
}

export default class AppInstanceRepo extends BaseRepo<AppInstance> {
  get entityClass() {
    return AppInstance;
  }

  get resourceType(): ResourceType {
    return ResourceType.AppInstance;
  }

  async create(
    input: RequiredEntityData<AppInstance>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isDevice = false
  ): Promise<AppInstance> {
    await this.checkActionAccess(resources.AppInstance.actions.create);
    const userGroup = (
      await new UserGroupRepo(this.ctx).getByFields({ name: 'root' })
    )[0];
    const user = await new UserRepo(this.ctx).create({
      name: input.name,
      // groupUserId: isDevice ? 'device' : 'app'
      groupUser: userGroup.id,
    });

    const result = await super.create({
      name: input.name,
      user: user.id,
      lifeStatus: 'stopped',
      appInstanceUrl: input.name,
      app: input.app,
      description: input.description,
      appVersion: input.appVersion,
      // instance_type_id: 'dev',
      // deploy_strategy_id: '',
      // remove_strategy_id: '',
    });

    EventsObserver.listener({
      type: 'createAppInstance',
      data: { appInstanceId: result.id },
    });

    return result;
  }

  async getUserRepo(): Promise<UserRepo> {
    await this.checkActionAccess(resources.AppInstance.actions.read);
    const data = await this.getEntity();
    return new UserRepo(this.ctx, data.user.id);
  }

  async getDataWithContainers(): Promise<AppInstance> {
    await this.checkActionAccess(resources.AppInstance.actions.read);
    const appInstance: AppInstance & { containers?: Container[] } =
      await this.getEntity();
    appInstance.containers = await Promise.all(
      (
        await this.getContainers()
      ).map((container) =>
        new ContainerRepo(this.ctx, container.id).getDataWithDetails()
      )
    );
    return appInstance;
  }

  async start() {
    await this.checkActionAccess(resources.AppInstance.actions.manage);
    const containers = (await this.getContainers()).map(
      (container) => new ContainerRepo(this.ctx, container.id)
    );
    for (const i in containers) {
      const container = containers[i];
      await container.start();
    }

    await this.update({ lifeStatus: 'running' });

    EventsObserver.listener({
      type: 'startAppInstance',
      data: { id: this.id },
    });
  }

  async stop() {
    await this.checkActionAccess(resources.AppInstance.actions.manage);
    const containers = (await this.getContainers()).map(
      (container) => new ContainerRepo(this.ctx, container.id)
    );
    for (const i in containers) {
      const container = containers[i];
      await container.stop();
    }

    await this.update({ lifeStatus: 'stopped' });

    EventsObserver.listener({ type: 'stopAppInstance', data: { id: this.id } });
  }

  async update(data: RequiredEntityData<AppInstance>): Promise<boolean> {
    await this.checkActionAccess(resources.AppInstance.actions.edit);
    const result = await super.update(data);

    EventsObserver.listener({ type: 'editAppInstance', data: { id: this.id } });
    return result;
  }

  async changeInstanceVersion(appVersionId: string): Promise<boolean> {
    await this.checkActionAccess(resources.AppInstance.actions.change_version);
    this.ctx = this.ctx.cloneNoRightsCheck();

    return await makeEm().transactional(async (em) => {
      this?.ctx.setTransactionContextEM(em);

      const instance = await this.getEntity();
      const newAppVersionRepo = new AppVersionRepo(this.ctx, appVersionId);

      const newAppVesion = await newAppVersionRepo.getEntity();
      await this.update({ appVersion: newAppVesion });

      const containers = await this.getContainers();
      await newAppVesion.images.init();
      const newVersionImages = newAppVesion.images.getItems();
      for (const container of containers) {
        const cr = new ContainerRepo(this.ctx, container.id);
        const containerImage = await cr.getImage();
        const containerGitRepo = (await containerImage.getEntity()).repository;
        const img = newVersionImages.find(
          (image) => image.repository === containerGitRepo
        );
        if (img) {
          await cr.update({ image: img });
        }
      }

      em.persistAndFlush(instance);

      this?.ctx.reliseTransactionContextEM();
      return true;
    });
  }

  async changeInstancesVersion(
    instancesIds: string[],
    appVersionId: string
  ): Promise<boolean> {
    for (const id of instancesIds) {
      await new AppInstanceRepo(this.ctx, id).changeInstanceVersion(
        appVersionId
      );
    }

    return true;
  }

  async delete(): Promise<boolean> {
    await this.checkActionAccess(resources.AppInstance.actions.remove);
    const data = await this.getEntity();

    const containers = (await this.getContainers()).map(
      (container) => new ContainerRepo(this.ctx, container.id)
    );
    containers.forEach((container) => {
      container.delete();
    });

    await super.delete();

    await new UserRepo(this.ctx, data.user.id).delete();

    EventsObserver.listener({
      type: 'removeAppInstance',
      data: { appInstanceId: this.id },
    });

    return true;
  }

  async getContainers(): Promise<Container[]> {
    await this.checkActionAccess(resources.AppInstance.actions.read);
    return new ContainerRepo(this.ctx).getByFields({
      appInstance: this.id,
    });
  }

  async build() {
    await this.checkActionAccess(resources.AppInstance.actions.build);
    const containers = (await this.getContainers()).map(
      (container) => new ContainerRepo(this.ctx, container.id)
    );
    const builded = [];
    for (const i in containers) {
      const container = containers[i];
      const image = await container.getImage();
      if (builded.includes(image.id)) {
        continue;
      }
      await image.build();
      builded.push(image.id);
    }
  }

  async getRuntimeVariables(): Promise<InstanceRuntimeVariables> {
    await this.checkActionAccess(resources.AppInstance.actions.read);
    const containers = await this.getContainers();
    const result: InstanceRuntimeVariables = { containers: {} };
    for (const i in containers) {
      const container = containers[i];
      const containerObject = new ContainerRepo(this.ctx, container.id);
      result.containers[container.name] =
        await containerObject.getRuntimeVariables(true);
    }
    return result;
  }

  async createConfiguratedInstance(
    appVersionId: string,
    instanceId: string | null,
    instanceData: InstanceDataInput
  ): Promise<AppInstance> {
    const appVersionRepo = new AppVersionRepo(this.ctx, appVersionId);
    const appVersion = await appVersionRepo.getEntity();

    return await makeEm().transactional(async (em) => {
      this.ctx.setTransactionContextEM(em);

      // Step 1. Create or reuse AppInstance
      let instance: AppInstance;
      if (instanceId) {
        instance = await new AppInstanceRepo(this.ctx, instanceId).getEntity();
      } else {
        instance = await this.create({
          name: instanceData.name,
          appVersion: appVersion,
        } as RequiredEntityData<AppInstance>);
      }

      // Step 2. Create containers
      for (const containerInput of instanceData.containers) {
        const containerRepo = new ContainerRepo(this.ctx);
        const container = await containerRepo.create({
          name: containerInput.name,
          node: containerInput.node,
          image: containerInput.image,
          outerPort: containerInput.outerPort,
          appInstance: instance,
        });

        // Step 3. Handle domain binding
        if (containerInput.domain) {
          const { id, domainData } = containerInput.domain;
          let domain;
          if (id) {
            domain = await new DomainRepo(this.ctx, id).getEntity();
          } else if (domainData) {
            domain = await new DomainRepo(this.ctx).create(domainData);
          }
          await containerRepo.update({ domain });
        }

        // Step 4. Handle volumes
        for (const volumeBindData of containerInput.volumes || []) {
          const innerVolume = volumeBindData.volume;
          let volumeEntity;
          if (innerVolume.id) {
            volumeEntity = await new VolumeRepo(
              this.ctx,
              innerVolume.id
            ).getEntity();
          } else if (innerVolume.volumeData) {
            volumeEntity = await new VolumeRepo(this.ctx).create(
              innerVolume.volumeData
            );
          }

          await new VolumeRepo(this.ctx, volumeEntity.id).addToContainer(
            container.id,
            volumeBindData.name,
            volumeBindData.innerPath
          );
        }

        // Step 5. Handle DB bindings
        for (const dbBind of containerInput.dbs || []) {
          const { db, dbUser, role } = dbBind;
          let dbEntity, dbUserEntity;

          if (db.id) {
            dbEntity = await new DbRepo(this.ctx, db.id).getEntity();
          } else if (db.dbData) {
            dbEntity = await new DbRepo(this.ctx).create(db.dbData);
          }

          if (dbUser.id) {
            dbUserEntity = await new DbUserRepo(
              this.ctx,
              dbUser.id
            ).getEntity();
          } else if (dbUser.dbUserData) {
            dbUserEntity = await new DbUserRepo(this.ctx).create(
              dbUser.dbUserData
            );
          }

          await new ContainerDbRepo(this.ctx).create({
            container: container.id,
            db: dbEntity.id,
            dbUser: dbUserEntity.id,
            role,
          });
        }

        // Step 6. Handle environment variables
        if (containerInput.envs?.length) {
          const envInputs: RequiredEntityData<ContainerVariable>[] =
            containerInput.envs.map((env) => ({
              container: container.id,
              name: env.name,
              value: env.value,
            }));
          await containerRepo.changeVariables(envInputs);
        }
      }

      await em.flush();
      this.ctx.reliseTransactionContextEM();
      return instance;
    });
  }
}
