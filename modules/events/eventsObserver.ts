import pubsub from '../../pubsub';
import AppInstanceAction from '../actions/appInstance.action';
import AppModel from '../models/app.model';
import AppInstanceModel from '../models/appInstance.model';
import { BuildEndedEvent } from './build.event';
import DockerEvent from './docker.event';
import { MegapolosEvent } from './event';

class EventsObserver {
  static async listener<T = MegapolosEvent>(event: T) {
    pubsub.publish('EVENT', { event });
    switch ((event as MegapolosEvent).type) {
      case 'buildEnded': {
        const buildEndedEvent = event as BuildEndedEvent;
        const containerId = buildEndedEvent.data.containerId;
        const container = await AppInstanceModel.getContainer(containerId);
        const appInstance = await AppInstanceModel.getAppInstance(container.app_instance_id);
        const image = await AppModel.getImage(container.image_id);
        const dockerContainer = await AppInstanceAction.createContainerAfterBuild({
          appId: appInstance.app_id,
          appInstanceId: appInstance.id,
          containerId: container.id,
          imageId: container.image_id,
          imageName: image.name,
          imageRepository: image.repository,
          innerPort: image.inner_port,
          outerPort: container.outer_port,
          userId: appInstance.user_id,
        });
        await AppInstanceModel.updateContainerDockerRuntimeId(containerId, dockerContainer.id);
      }
      case 'DockerEvent': {
        const dockerEvent = event as DockerEvent;
        // console.log(dockerEvent.data);
      }
    }
  }
}

export default EventsObserver;