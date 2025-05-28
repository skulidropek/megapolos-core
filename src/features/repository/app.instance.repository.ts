import EventsObserver from '../events/eventsObserver';
import { resources, ResourceType } from '../rights/resources.list';
import BaseRepo from './base.repository';
import { AppInstance } from '../../domain/entities/AppInstance.entity';
import UserRepo from './user/user.repository';
import UserGroupRepo from './user/user.group.repository';
import {
  ContainerRepo,
  ContainerResult,
  ContainerRuntimeVariables,
} from './cantainer/container.repository';
import { RequiredEntityData } from '@mikro-orm/core';
import { Container } from '../../domain/entities/Container.entity';

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
    await this.checkActionAccess(resources.app_instance.actions.create);
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
    await this.checkActionAccess(resources.app_instance.actions.read);
    const data = await this.getEntity();
    return new UserRepo(this.ctx, data.user.id);
  }

  async getDataWithContainers(): Promise<AppInstance> {
    await this.checkActionAccess(resources.app_instance.actions.read);
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
    await this.checkActionAccess(resources.app_instance.actions.manage);
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
    await this.checkActionAccess(resources.app_instance.actions.manage);
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
    await this.checkActionAccess(resources.app_instance.actions.edit);
    const result = await super.update(data);

    EventsObserver.listener({ type: 'editAppInstance', data: { id: this.id } });
    return result;
  }

  async delete(): Promise<boolean> {
    await this.checkActionAccess(resources.app_instance.actions.remove);
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
    await this.checkActionAccess(resources.app_instance.actions.read);
    return new ContainerRepo(this.ctx).getByFields({
      appInstance: this.id,
    });
  }

  async build() {
    await this.checkActionAccess(resources.app_instance.actions.build);
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
    await this.checkActionAccess(resources.app_instance.actions.read);
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
}
