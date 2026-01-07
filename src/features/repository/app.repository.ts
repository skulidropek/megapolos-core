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
import { ResourceType } from '../rights/resources.list';
import path from 'path';
import fs from 'fs';
import { UploadedFiles } from '../../domain/entities/UploadedFiles.entity';

export default class AppRepo extends BaseRepo<App> {
  get entityClass() {
    return App;
  }

  get resourceType(): ResourceType {
    return ResourceType.App;
  }
  async exportApp(id: string) {
    const exportData = await makeEm().find(App, id, {
      populate: ['appVersions', 'configurations', 'configurations.services'],
    });
    const exist = await makeEm().find(UploadedFiles, {
      originalName: exportData[0].name,
    });
    if (exist.length) throw new Error('Приложение уже экспортировано');

    const fileName = `exportApp-${id}-${Date.now()}.json`;
    const filePath = path.join(__dirname, '../../../uploads', fileName);
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf-8');
    await makeEm().insert(UploadedFiles, {
      filename: fileName,
      originalName: exportData[0].name,
    });
  }

  async installApp(userId: string, input: AppInput): Promise<App> {
    const app = await this.create({
      ownerUser: userId,
      name: input.name,
      description: input.description,
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
    const images = await new ImageRepo(this.ctx).getByFields(
      { app: this.id },
      { populate: ['appVersions'] }
    );

    const imagesWithoutVersions = images.filter((image) =>
      image.appVersions.isEmpty()
    );
    return imagesWithoutVersions;
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
