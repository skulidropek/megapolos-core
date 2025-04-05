import { AppInput, ContainerInput } from '../../domain/types';
import ImageRepo from './image.repository';
import EventsObserver from '../events/eventsObserver';
import UserRepo from './user/user.repository';
import BaseRepo from './base.repository';
import RepositoryRepo from './repository.repository';
import { App } from '../../domain/entities/App.entity';
import { Image } from '../../domain/entities/Image.entity';
import { makeEm } from '../db/mikro-orm';
import { AppInstance } from '../../domain/entities/AppInstance.entity';
import AppInstanceRepo from './app.instance.repository';
import { Repository } from '../../domain/entities/Repository.entity';

export default class AppRepo extends BaseRepo<App> {
  get entityClass() {
    return App;
  }

  async installApp(userId: string, input: AppInput): Promise<App> {
    const app = await this.create({
      ownerUser: userId,
      name: input.name,
    });
    for (let i in input.images) {
      const image = input.images[i];
      await new ImageRepo(this.ctx).create({
        app: app,
        name: image.name,
        innerPort: image.inner_port,
        image: image.image,
      });
    }
    EventsObserver.listener({ type: 'installApp', data: { userId, input } });
    return app;
  }

  async getDataWithImages(): Promise<App & { images?: Image[] }> {
    const app = await this.getEntity();
    const images = await makeEm().find(Image, { app: app });
    app['images'] = images;
    return app;
  }

  createInstance(
    name: string,
    containers: ContainerInput[],
    isDevice = false
  ): Promise<AppInstance> {
    return new AppInstanceRepo(this.ctx).create(
      { app: this.id, name },
      isDevice
    );
  }

  async removeInstances(): Promise<void> {
    const instances = (await this.getInstances()).map(
      (instance) => new AppInstanceRepo(this.ctx, instance.id)
    );
    for (let i in instances) {
      await instances[i].delete();
    }
  }

  async getInstances(): Promise<AppInstance[]> {
    return new AppInstanceRepo(this.ctx).getByFields({ app: this.id });
  }

  async getImages(): Promise<Image[]> {
    return new ImageRepo(this.ctx).getByFields({ app: this.id });
  }

  async getRepositories(): Promise<Repository[]> {
    return new RepositoryRepo(this.ctx).getByFields({ app: this.id });
  }

  async getUser(): Promise<UserRepo> {
    const data = await this.getEntity();
    return new UserRepo(this.ctx, data.ownerUser.id);
  }

  addImage(image: Partial<Image>): Promise<Image> {
    return new ImageRepo(this.ctx).create({
      ...image,
      app: this.id,
    });
  }

  async delete(): Promise<boolean> {
    await this.removeInstances();
    const images = (await this.getImages()).map(
      (image) => new ImageRepo(this.ctx, image.id)
    );
    for (let i in images) {
      await images[i].delete();
    }
    return super.delete();
  }
}
