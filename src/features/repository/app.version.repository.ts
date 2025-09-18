import EventsObserver from '../events/eventsObserver';
import { resources, ResourceType } from '../rights/resources.list';
import BaseRepo from './base.repository';
import { AppVersion } from '../../domain/entities/AppVersion.entity';
import { makeEm, mem } from '../db/mikro-orm';
import {
  AppVersionInput,
  AppVersionImageInput,
} from '../../api/graphql/resolvers/app.version.resolver';
import { Image } from '../../domain/entities/Image.entity';
import ImageRepo from './image.repository';
import { RequiredEntityData } from '@mikro-orm/core';
import { App } from '../../domain/entities/App.entity';
import AppRepo from './app.repository';

export default class AppVersionRepo extends BaseRepo<AppVersion> {
  get entityClass() {
    return AppVersion;
  }

  get resourceType(): ResourceType {
    return ResourceType.AppVersion;
  }

  async getImages(): Promise<Image[]> {
    const appVersion = await this.getEntity();
    const images = await appVersion.images.loadItems();
    return new ImageRepo(this.ctx).filterEntitiesByAccess(images);
  }

  async createAppVersion(
    appVersionData: RequiredEntityData<AppVersion>,
    images_data: AppVersionImageInput[]
  ): Promise<AppVersion> {
    await this.checkActionAccess(resources.AppVersion.actions.create);
    const application = await new AppRepo(
      this.ctx,
      appVersionData.app as string
    ).getEntity();
    const appVersion = await super.create({
      app: application,
      buildNumber: appVersionData.buildNumber,
      version: appVersionData.version,
      versionComment: appVersionData.versionComment,
    });

    // Array to hold Image entities' ids to associate with this version
    const imageIds: string[] = [];

    for (const input of images_data) {
      if (input.imageId) {
        // Existing image case
        const image = await new ImageRepo(this.ctx, input.imageId).getEntity();
        if (!image) {
          throw new Error(`Image with id ${input.imageId} not found`);
        }
        imageIds.push(input.imageId);
      } else if (input.imageData) {
        // New image case
        const image = await new ImageRepo(this.ctx).create(input.imageData);
        imageIds.push(image.id);
      }
    }

    const em = makeEm();

    for (const imageId of imageIds) {
      const image = await em.findOne(Image, { id: imageId });
      appVersion.images.add(image);
    }

    await em.persistAndFlush(appVersion);

    EventsObserver.listener({
      type: 'createAppVersion',
      data: { AppVersionId: appVersion.id },
    });

    return appVersion;
  }
}
