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

  static async getInstances(): Promise<Instance[]> {
    return (await AppInstanceModel.getAppInstances()).map((appInstance) => new Instance(appInstance.id));
  }

  async getData() {
    return AppInstanceModel.getAppInstance(this.id);
  }

  async getDataWithContainers(): Promise<AppInstanceResult> {
    const appInstance:AppInstanceResult = await AppInstanceModel.getAppInstance(this.id);
    appInstance.containers = await AppInstanceModel.getAppInstanceContainers(this.id);
    const containers = appInstance.containers;
    for (let j in containers) {
      const devices = await DeviceModel.getDevicesOfContainer(containers[j].id);
      containers[j].devices = [];
      for (let k in devices) {
        const auxOptions = await DeviceModel.getDeviceAuxOptionsOfContainer(devices[k].id, containers[j].id);
        const envs = await DeviceModel.getDeviceEnvsOfContainer(devices[k].id, containers[j].id);
        containers[j].devices.push({
          device: devices[k],
          parameters: auxOptions.map((option) => ({ key: option.device_option_name, value: option.container_option_value })),
          env_parameters: envs.map((env) => ({ key: env.device_option_name, value: env.container_env_name })),
        });
      }
      const volumes = await VolumeModel.getVolumesOfContainer(containers[j].id);
      containers[j].volumes = volumes;
      const envs = await AppInstanceModel.getContainerEnvOptions(containers[j].id);
      containers[j].envs = envs.map((env) => ({ key: env.container_env_name, value: env.container_env_value }));
      if (containers[j].docker_runtime_id) {
        try {
          const dockerStatus = (await docker.getContainer(containers[j].docker_runtime_id).inspect()).State.Status;
          containers[j].docker_status = dockerStatus;
        } catch (e) {
          containers[j].docker_status = 'not exist';
        }
      }
    }
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

  async remove() {
    const data = await this.getData();

    const containers = await this.getContainers();
    containers.forEach(container => {
      container.remove();
    });

    await AppInstanceModel.removeAppInstance(this.id);

    await new User(data.user_id).remove();

    EventsObserver.listener({ 'type': 'removeAppInstance', data:{ appInstanceId } });
  }

  async getContainers(): Promise<Container[]> {
    return (await AppInstanceModel.getAppInstanceContainers(this.id)).map((container) => new Container(container.id));
  }

}

export default Instance;