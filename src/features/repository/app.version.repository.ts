import EventsObserver from '../events/eventsObserver';
import { resources, ResourceType } from '../rights/resources.list';
import BaseRepo from './base.repository';
import { AppVersion } from '../../domain/entities/AppVersion.entity';
import { makeEm, mem } from '../db/mikro-orm';
import {
  AppVersionInput,
  AppVersionImageInput,
} from '../../api/graphql/resolvers/app.version.resolver';
import { App } from '../../domain/entities/App.entity';
import { Image } from '../../domain/entities/Image.entity';
import ImageRepo from './image.repository';

export default class AppVersionRepo extends BaseRepo<AppVersion> {
  get entityClass() {
    return AppVersion;
  }

  get resourceType(): ResourceType {
    return ResourceType.AppVersion;
  }

  async createAppVersion(
    appVersionData: AppVersionInput,
    images_data: AppVersionImageInput[]
  ): Promise<AppVersion> {
    await this.checkActionAccess(resources.app_version.actions.create);

    const appVersion = await super.create({
      app_id: appVersionData.app_id,
      build_number: appVersionData.build_number,
      version: appVersionData.version,
      version_comment: appVersionData.version_comment,
    });

    // Array to hold Image entities' ids to associate with this version
    const imageIds: string[] = [];

    for (const input of images_data) {
      if (input.image_id) {
        // Existing image case
        const image = await new ImageRepo(this.ctx, input.image_id).getEntity();
        if (!image) {
          throw new Error(`Image with id ${input.image_id} not found`);
        }
        imageIds.push(input.image_id);
      } else if (input.image_data) {
        // New image case
        const image = await new ImageRepo(this.ctx).create(input.image_data);
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
