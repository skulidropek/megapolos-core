import { v4 as uuidv4 } from 'uuid';
import EventsObserver from '../modules/events/eventsObserver';
import AppInstanceModel from '../modules/models/appInstance.model';
import { AppInstanceInput } from '../types';
import Container from './Container';
import App from './App';
import User from './User';
import ContainerCreate from './ContainerCreate';

class Instance {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
  
  static async createInstance(input: AppInstanceInput, isDevice = false): Promise<Instance> {
    const appInstanceId = uuidv4();
  
    const app = new App(input.app_id);
    const images = await app.getImages();
    const user = await User.createUser({ name: input.name, groupUserId: isDevice ? 'device' : 'app' }, isDevice);
  
    await AppInstanceModel.createAppInstance({
      id: appInstanceId,
      name: input.name,
      user_id: user.id,
      life_status: 'stopped',
      app_instance_url: input.name,
      app_id: input.app_id,
      instance_type_id: 'dev',
      deploy_strategy_id: '',
      remove_strategy_id: '',
    });

    const instance = new Instance(appInstanceId);
  
    for (let i in images) {
      const image = images[i];
      await Container.createFromImage(instance, image, input.containers.find((_container) => _container.image_id === image.id));
    }

    EventsObserver.listener({ 'type': 'createAppInstance', data: { appInstanceId } });
  
    return appInstanceId;
  }

  async getData() {
    return AppInstanceModel.getAppInstance(this.id);
  }

  async start() {
    const containers = await this.getContainers();
    for (const i in containers) {
      const container = containers[i];
      await container.start();
    }

    await AppInstanceModel.updateAppInstanceLifeStatus(this.id, 'running');

    EventsObserver.listener({ 'type': 'startAppInstance', data:{ id: this.id } });
  }

  async stop() {
    const containers = await this.getContainers();
    for (const i in containers) {
      const container = containers[i];
      await container.stop();
    }

    await AppInstanceModel.updateAppInstanceLifeStatus(this.id, 'stopped');

    EventsObserver.listener({ 'type': 'stopAppInstance', data:{ id: this.id } });
  }

  async remove() {
    const containers = await this.getContainers();
    containers.forEach(container => {
      container.remove();
    });
  }

  async getContainers(): Promise<Container[]> {
    return (await AppInstanceModel.getAppInstanceContainers(this.id)).map((container) => new Container(container.id));
  }

}

export default Instance;