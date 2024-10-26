import { v4 as uuidv4 } from 'uuid';
import EventsObserver from '../modules/events/eventsObserver';
import { AppInstanceInput, AppInstanceResult } from '../types';
import Container from './Container';
import App from './App';
import User from './User';
import { AppInstanceTable, ContainerTable } from '../modules/models/tables';
import BaseRepository from './BaseRepository';
import UserGroup from './UserGroup';

class Instance extends BaseRepository<AppInstanceTable> {
  getTable(): string {
    return 'app_instance';
  }
  
  async create(input: Partial<AppInstanceTable>, isDevice = false): Promise<AppInstanceTable> {
    const userGroup = await (new UserGroup().getByFields({ name: 'root' }))[0];
    const user = await new User().create({ name: input.name, 
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

    EventsObserver.listener({ 'type': 'createAppInstance', data: { appInstanceId: result.id } });
  
    return result;
  }

  async getUser():Promise<User> {
    const data = await this.getData();
    return new User(data.user_id);
  }

  async getDataWithContainers(): Promise<AppInstanceResult> {
    const appInstance:AppInstanceResult = await this.getData();
    appInstance.containers = await Promise.all((await this.getContainers()).map((container) => new Container(container.id).getDataWithDetails()));
    return appInstance;
  }

  async start() {
    const containers = (await this.getContainers()).map(container => new Container(container.id));
    for (const i in containers) {
      const container = containers[i];
      await container.start();
    }

    await this.edit({ life_status: 'running' });

    EventsObserver.listener({ 'type': 'startAppInstance', data:{ id: this.id } });
  }

  async stop() {
    const containers = (await this.getContainers()).map(container => new Container(container.id));
    for (const i in containers) {
      const container = containers[i];
      await container.stop();
    }

    await this.edit({ life_status: 'stopped' });

    EventsObserver.listener({ 'type': 'stopAppInstance', data:{ id: this.id } });
  }

  async edit(data: Partial<AppInstanceTable>) {
    const result = await super.edit(data);

    EventsObserver.listener({ 'type': 'editAppInstance', data:{ id: this.id } });
    return result;
  }

  async delete(): Promise<boolean> {
    const data = await this.getData();

    const containers = (await this.getContainers()).map(container => new Container(container.id));
    containers.forEach(container => {
      container.delete();
    });

    await super.delete();

    await new User(data.user_id).delete();

    EventsObserver.listener({ 'type': 'removeAppInstance', data:{ appInstanceId: this.id } });

    return true;
  }

  async getContainers(): Promise<ContainerTable[]> {
    return new Container().getByFields({ app_instance_id: this.id });
  }

  async build() {
    const containers = (await this.getContainers()).map(container => new Container(container.id));
    const builded = [];
    for (const i in containers) {
      const container = containers[i];
      const image = await container.getImage();
      if (builded.includes(image.id)) {
        continue;
      }
      await image.build('root');
      builded.push(image.id);
    }
  }

}

export default Instance;