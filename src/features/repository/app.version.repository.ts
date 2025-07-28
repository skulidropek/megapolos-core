import EventsObserver from '../events/eventsObserver';
import { resources, ResourceType } from '../rights/resources.list';
import BaseRepo from './base.repository';
import { AppVersion } from '../../domain/entities/AppVersion.entity';

export default class AppVersionRepo extends BaseRepo<AppVersion> {
  get entityClass() {
    return AppVersion;
  }

  get resourceType(): ResourceType {
    return ResourceType.AppVersion;
  }

  async createAppVersion(
    app_id: string,
    image_ids: string[]
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
