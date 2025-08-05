import EventsObserver from '../events/eventsObserver';
import { resources, ResourceType } from '../rights/resources.list';
import BaseRepo from './base.repository';
import { AppVersion } from '../../domain/entities/AppVersion.entity';
import { Image } from 'dockerode';
import { makeEm, mem } from '../db/mikro-orm';
import { AppVersionInput } from '../../api/graphql/resolvers/app.version.resolver';
import { App } from '../../domain/entities/App.entity';

export default class AppVersionRepo extends BaseRepo<AppVersion> {
  get entityClass() {
    return AppVersion;
  }

  get resourceType(): ResourceType {
    return ResourceType.AppVersion;
  }

  //     await mem(async (em) => {
  //       const app = await em.findOne(App, app_id);
  //       // const dbUser = await em.findOne(DbUser, this.id);
  //       app.users.add(this.getEntity());
  //       await em.flush();
  //     });

  async createAppVersion(
    app_id: string,
    images_data: AppVersionInput[]
  ): Promise<AppVersion> {
    await this.checkActionAccess(resources.app_version.actions.create);

    const em = makeEm();

    const appVersion = em.create(AppVersion, {
      app_id,
      build_number: 0,
      version: 'version',
      version_comment: 'version_comment',
    });

    // Array to hold Image entities to associate with this version
    const images: Image[] = [];

    for (const input of images_data) {
      let image: Image;

      if ('image_id' in input) {
        const appVersion = await em.findOne(AppVersion, { id: this.id });
        image = await em.findOne(Image, { id: input.image_id });
        if (!image) {
          throw new Error(`Image with id ${input.image_id} not found`);
        }
        appVersion.images.add(image);
        await em.persistAndFlush(appVersion);
      } else if ('image_data' in input) {
        image = em.create(Image, {
          input.image_data
        });
        await em.persistAndFlush(image);
      }

      if (image) {
        images.push(image);
      }
    }

    await em.persistAndFlush(appVersion);

    EventsObserver.listener({
      type: 'createAppVersion',
      data: { AppVersionId: appVersion.id },
    });

    return appVersion;
  }

  async createAppVersion(
    app_id: string,
    images_data: AppVersionInput[]
  ): Promise<AppVersion> {
    await this.checkActionAccess(resources.app_version.actions.create);

    // TODO - use image ids or image data
    const result = await super.create({
      app_id: app_id,
      build_number: 0,
      version: app_id,
      version_comment: app_id,
    });

    EventsObserver.listener({
      type: 'createAppVersion',
      data: { AppVersionId: result.id },
    });

    return result;
  }
}
