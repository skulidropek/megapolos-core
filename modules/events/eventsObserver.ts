import { BuildEndedEvent } from './build.event';
import DockerEvent from './docker.event';
import { MegapolosEvent } from './event';

class EventsObserver {
  static listener<T = MegapolosEvent>(event: T) {
    switch ((event as MegapolosEvent).type) {
      case 'buildEnded': {
        const buildEndedEvent = event as BuildEndedEvent;
        // AppInstanceAction.createContainer(buildEndedEvent.data.containerId, buildEndedEvent.data.imageName);
      }
      case 'DockerEvent': {
        const dockerEvent = event as DockerEvent;
        // console.log(dockerEvent.data);
      }
    }
  }
}

export default EventsObserver;