import EventsObserver from '../modules/events/eventsObserver';
import { AppInstanceTable, ContainerTable } from '../modules/models/tables';
import { resources } from '../src/features/rights/resources_list';
import { AppInstanceResult } from '../types';
import BaseRepository from './BaseRepository';
import Container, { ContainerRuntimeVariables } from './Container';
import User from './User';
import UserGroup from './UserGroup';

export interface InstanceRuntimeVariables {
  containers: {
    [key: string]: ContainerRuntimeVariables;
  };
}

class Instance extends BaseRepository<AppInstanceTable> {
  getTable(): string {
    return 'app_instance';
  }

  async create(
    input: Partial<AppInstanceTable>,
    isDevice = false,
  ): Promise<AppInstanceTable> {
    await this.checkActionAccess(resources.app_instance.actions.create);
    const userGroup = (await new UserGroup().getByFields({ name: 'root' }))[0];
    const user = await new User().create({
      name: input.name,
      // groupUserId: isDevice ? 'device' : 'app'
      group_user_id: userGroup.id,
    });

    const result = await super.create({
      name: input.name,
      user_id: user.id,
      life_status: 'stopped',
      app_instance_url: input.name,
      app_id: input.app_id,
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

  async getUser(): Promise<User> {
    await this.checkActionAccess(resources.app_instance.actions.read);
    const data = await this.getData();
    return new User(data.user_id);
  }

  async getDataWithContainers(): Promise<AppInstanceResult> {
    await this.checkActionAccess(resources.app_instance.actions.read);
    const appInstance: AppInstanceResult = await this.getData();
    appInstance.containers = await Promise.all(
      (await this.getContainers()).map((container) =>
        new Container(container.id, this.userId).getDataWithDetails()
      ),
    );
    return appInstance;
  }

  async start() {
    await this.checkActionAccess(resources.app_instance.actions.manage);
    const containers = (await this.getContainers()).map(container =>
      new Container(container.id, this.userId)
    );
    for (const i in containers) {
      const container = containers[i];
      await container.start();
    }

    await this.edit({ life_status: 'running' });

    EventsObserver.listener({
      type: 'startAppInstance',
      data: { id: this.id },
    });
  }

  async stop() {
    await this.checkActionAccess(resources.app_instance.actions.manage);
    const containers = (await this.getContainers()).map(container =>
      new Container(container.id, this.userId)
    );
    for (const i in containers) {
      const container = containers[i];
      await container.stop();
    }

    await this.edit({ life_status: 'stopped' });

    EventsObserver.listener({ type: 'stopAppInstance', data: { id: this.id } });
  }

  async edit(data: Partial<AppInstanceTable>) {
    await this.checkActionAccess(resources.app_instance.actions.edit);
    const result = await super.edit(data);

    EventsObserver.listener({ type: 'editAppInstance', data: { id: this.id } });
    return result;
  }

  async delete(): Promise<boolean> {
    await this.checkActionAccess(resources.app_instance.actions.remove);
    const data = await this.getData();

    const containers = (await this.getContainers()).map(container =>
      new Container(container.id, this.userId)
    );
    containers.forEach(container => {
      container.delete();
    });

    await super.delete();

    await new User(data.user_id).delete();

    EventsObserver.listener({
      type: 'removeAppInstance',
      data: { appInstanceId: this.id },
    });

    return true;
  }

  async getContainers(): Promise<ContainerTable[]> {
    await this.checkActionAccess(resources.app_instance.actions.read);
    return new Container(undefined, this.userId).getByFields({ app_instance_id: this.id });
  }

  async build() {
    await this.checkActionAccess(resources.app_instance.actions.build);
    const containers = (await this.getContainers()).map(container =>
      new Container(container.id, this.userId)
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
      const containerObject = new Container(container.id);
      result.containers[container.name] = await containerObject
        .getRuntimeVariables(true);
    }
    return result;
  }
}

export default Instance;
