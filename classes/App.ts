import { v4 as uuidv4 } from 'uuid';
import AppModel from '../modules/models/app.model';
import { AppInput, ContainerInput } from '../types';
import Image from './Image';
import Instance from './Instance';
import EventsObserver from '../modules/events/eventsObserver';
import AppInstanceModel from '../modules/models/appInstance.model';
import { AppTable, ImageTable } from '../modules/models/tables';
import User from './User';

class App {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  static async installApp(userId, input: AppInput): Promise<App> {
    const appId = uuidv4();
      
    await AppModel.createApp({
      id: appId,
      ownerUserId: userId,
      name: input.name,
    });
    const app = new App(appId);
    for (let i in input.images) {
      const image = input.images[i];
      await app.addImage(image);
    }
    EventsObserver.listener({ 'type': 'installApp', data: { userId, input } });
    return new App(appId);
  }

  static async getApps(): Promise<App[]> {
    return (await AppModel.getApps()).map((app) => new App(app.id));
  }

  getData(): Promise<AppTable> {
    return AppModel.getApp(this.id);
  }

  async getDataWithImages(): Promise<AppTable & { images?: ImageTable[] }> {
    const result:(AppTable & { images?: ImageTable[] }) = await this.getData();
    const images = (await this.getImages()).map(image => image.getData());
    result.images = await Promise.all(images);
    return result;
  }
  
  createInstance(name: string, containers: ContainerInput[], isDevice = false): Promise<Instance> {
    return Instance.createInstance({ app_id: this.id, name, containers }, isDevice);
  }

  async removeInstances(): Promise<void> {
    const instances = await this.getInstances();
    for (let i in instances) {
      await instances[i].remove();
    }
  }

  async getInstances(): Promise<Instance[]> {
    return (await AppInstanceModel.getAppInstances()).map((instance) => new Instance(instance.id));
  }

  async getImages(): Promise<Image[]> {
    return (await AppModel.getImagesOfApp(this.id)).map((image) => new Image(image.id));
  }

  async getUser(): Promise<User> {
    const data = await this.getData();
    return new User(data.owner_user_id);
  }

  addImage(image: { name: string, image: string, inner_port: number }): Promise<Image> {
    return Image.createImage(this.id, image);
  }

  async uninstall() {
    await this.removeInstances();
    const images = await this.getImages();
    for (let i in images) {
      await images[i].remove();
    }
    await AppModel.removeApp(this.id);
  }
}

export default App;