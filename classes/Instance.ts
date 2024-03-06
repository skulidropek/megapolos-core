import { v4 as uuidv4 } from 'uuid';
import EventsObserver from '../modules/events/eventsObserver';
import AppInstanceModel from '../modules/models/appInstance.model';
import { AppInstanceInput, AppInstanceResult } from '../types';
import Container from './Container';
import App from './App';
import User from './User';
import ContainerCreate from './ContainerCreate';
import DeviceModel from '../modules/models/device.model';
import VolumeModel from '../modules/models/volume.model';
import docker from '../coreDocker';
import { AppInstanceTable } from '../modules/models/tables';
import UserModel from '../modules/models/user.model';

class Instance {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
  
  static async createInstance(input: Partial<AppInstanceTable>, isDevice = false): Promise<Instance> {
    const appInstanceId = uuidv4();
  
    const userGroup = await UserModel.getUserGroupByName('root');
    const user = await User.createUser({ name: input.name, 
      // groupUserId: isDevice ? 'device' : 'app' 
      groupUserId: userGroup.id,
    }, isDevice);
  
    await AppInstanceModel.createAppInstance({
      id: appInstanceId,
      name: input.name,
      user_id: user.id,
      life_status: 'stopped',
      app_instance_url: input.name,
      app_id: input.app_id,
      // instance_type_id: 'dev',
      // deploy_strategy_id: '',
      // remove_strategy_id: '',
    });

    EventsObserver.listener({ 'type': 'createAppInstance', data: { appInstanceId } });
  
    return appInstanceId;
  }

  static async getInstances(): Promise<Instance[]> {
    return (await AppInstanceModel.getAppInstances()).map((appInstance) => new Instance(appInstance.id));
  }

  async getData() {
    return AppInstanceModel.getAppInstance(this.id);
  }

  async getUser():Promise<User> {
    const data = await this.getData();
    return new User(data.user_id);
  }

  async getDataWithContainers(): Promise<AppInstanceResult> {
    const appInstance:AppInstanceResult = await AppInstanceModel.getAppInstance(this.id);
    appInstance.containers = await Promise.all((await this.getContainers()).map((container) => container.getDataWithDetails()));
    return appInstance;
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

  async edit(name: string) {
    await AppInstanceModel.editInstance(this.id, { name });

    EventsObserver.listener({ 'type': 'editAppInstance', data:{ id: this.id } });
  }

  async remove() {
    const data = await this.getData();

    const containers = await this.getContainers();
    containers.forEach(container => {
      container.remove();
    });

    await AppInstanceModel.removeAppInstance(this.id);

    await new User(data.user_id).remove();

    EventsObserver.listener({ 'type': 'removeAppInstance', data:{ appInstanceId: this.id } });
  }

  async getContainers(): Promise<Container[]> {
    return (await AppInstanceModel.getAppInstanceContainers(this.id)).map((container) => new Container(container.id));
  }

}

export default Instance;