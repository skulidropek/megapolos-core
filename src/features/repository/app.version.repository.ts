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
import { ImageStatus } from '../db/tables';

export default class AppVersionRepo extends BaseRepo<AppVersion> {
  get entityClass() {
    return AppVersion;
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
    const appRepo = new AppRepo(this.ctx, appVersionData.app as string);
    await appRepo.checkActionAccess(resources.App.actions.add_app_version);
    this.ctx = this.ctx.cloneNoRightsCheck();

    return await makeEm().transactional(async (em) => {
      this?.ctx.setTransactionContextEM(em);

      const application = await appRepo.getEntity();
      const appVersion = await super.create({
        app: application,
        configuration: appVersionData.configuration,
        buildNumber: appVersionData.buildNumber,
        version: appVersionData.version,
        versionComment: appVersionData.versionComment,
      });

      // Array to hold Image entities' ids to associate with this version
      const imageIds: string[] = [];

      for (const input of images_data) {
        if (input.imageId) {
          // Existing image case
          const image = await new ImageRepo(
            this.ctx,
            input.imageId
          ).getEntity();
          if (!image) {
            throw new Error(`Image with id ${input.imageId} not found`);
          }
          imageIds.push(input.imageId);
        } else if (input.imageData) {
          // New image case
          const image = await new ImageRepo(this.ctx).create({
            ...input.imageData,
            app: application,
            status: ImageStatus.NotExist,
          });
          imageIds.push(image.id);
        }
      }

      for (const imageId of imageIds) {
        const image = await em.findOne(Image, { id: imageId });
        appVersion.images.add(image);
      }

      await em.persistAndFlush(appVersion);

      EventsObserver.listener({
        type: 'createAppVersion',
        data: { AppVersionId: appVersion.id },
      });

      this?.ctx.reliseTransactionContextEM();
      return appVersion;
    });
  }

  async editAppVersion(
    appVersionData: RequiredEntityData<AppVersion>,
    images_data: AppVersionImageInput[]
  ): Promise<Boolean> {
    await this.checkOnlyRootAccess();

    return await makeEm().transactional(async (em) => {
      this?.ctx.setTransactionContextEM(em);

      await super.update({
        version: appVersionData.version,
        versionComment: appVersionData.versionComment,
      });

      const appVersion = await this.getEntity();
      const application = await new AppRepo(
        this.ctx,
        appVersion.app.id
      ).getEntity();
      const newImages: Image[] = [];

      for (const input of images_data) {
        if (input.imageId) {
          const image = await new ImageRepo(
            this.ctx,
            input.imageId
          ).getEntity();
          if (!image) {
            throw new Error(`Image with id ${input.imageId} not found`);
          }
          newImages.push(image);
        } else if (input.imageData) {
          const image = await new ImageRepo(this.ctx).create({
            ...input.imageData,
            app: application,
            status: ImageStatus.NotExist,
          });
          newImages.push(image);
        }
      }

      const oldImages = await appVersion.images.loadItems();

      appVersion.images.removeAll();
      for (const image of newImages) {
        appVersion.images.add(image);
      }

      await em.persistAndFlush(appVersion);

      for (const oldImage of oldImages) {
        const linksFromAppVersions = await em.count(AppVersion, {
          images: oldImage,
        });

        if (linksFromAppVersions === 0 && oldImage.app == null) {
          await em.removeAndFlush(oldImage);
        }
      }

      EventsObserver.listener({
        type: 'editAppVersion',
        data: { AppVersionId: appVersion.id },
      });

      this?.ctx.reliseTransactionContextEM();
      return true;
    });
  }

  async deleteAppVersion(): Promise<boolean> {
    await this.checkOnlyRootAccess();

    return await makeEm().transactional(async (em) => {
      this?.ctx.setTransactionContextEM(em);

      const appVersion = await this.getEntity();
      const oldImages = await appVersion.images.loadItems();

      appVersion.images.removeAll();
      await this.delete();
      await em.persistAndFlush(appVersion);

      for (const oldImage of oldImages) {
        const linksFromAppVersions = await em.count(AppVersion, {
          images: oldImage,
        });

        if (linksFromAppVersions === 0 && oldImage.app == null) {
          await em.removeAndFlush(oldImage);
        }
      }

      this?.ctx.reliseTransactionContextEM();
      return true;
    });
  }
}
