import { v4 as uuidv4 } from 'uuid';
import { AppInput, ContainerInput } from '../types';
import Image from './Image';
import Instance from './Instance';
import EventsObserver from '../modules/events/eventsObserver';
import { AppInstanceTable, AppTable, ImageTable } from '../modules/models/tables';
import User from './User';
import BaseRepository from './BaseRepository';

class App extends BaseRepository<AppTable> {
  getTable(): string {
    return 'app';
  }

  async installApp(userId, input: AppInput): Promise<AppTable> {
    const app = await this.create({
      owner_user_id: userId,
      name: input.name,
    });
    for (let i in input.images) {
      const image = input.images[i];
      await new Image().create({
        app_id: app.id,
        name: image.name,
        inner_port: image.inner_port,
        image: image.image,
      });
    }
    EventsObserver.listener({ 'type': 'installApp', data: { userId, input } });
    return app;
  }

  async getDataWithImages(): Promise<AppTable & { images?: ImageTable[] }> {
    const result:(AppTable & { images?: ImageTable[] }) = await this.getData();
    const images = await this.getImages();
    result.images = await Promise.all(images);
    return result;
  }
  
  createInstance(name: string, containers: ContainerInput[], isDevice = false): Promise<AppInstanceTable> {
    return new Instance().create({ app_id: this.id, name }, isDevice);
  }

  async removeInstances(): Promise<void> {
    const instances = (await this.getInstances()).map(instance => new Instance(instance.id));
    for (let i in instances) {
      await instances[i].delete();
    }
  }

  async getInstances(): Promise<AppInstanceTable[]> {
    return new Instance().getByFields({ app_id: this.id });
  }

  async getImages(): Promise<ImageTable[]> {
    return new Image().getByFields({ app_id: this.id });
  }

  async getUser(): Promise<User> {
    const data = await this.getData();
    return new User(data.owner_user_id);
  }

  addImage(image: Partial<ImageTable>): Promise<ImageTable> {
    return new Image().create({
      ...image,
      app_id: this.id,
    });
  }

  async delete(): Promise<boolean> {
    await this.removeInstances();
    const images = (await this.getImages()).map(image => new Image(image.id));
    for (let i in images) {
      await images[i].delete();
    }
    return super.delete();
  }
}

export default App;