import AppAction from '../actions/app.action';
import { BuildEndedEvent } from './build.event';
import { MegapolosEvent } from './event';

class EventsObserver {
  static listener(event: MegapolosEvent) {
    switch (event.type) {
      case 'buildEnded': {
        const buildEndedEvent = event as BuildEndedEvent;
        AppAction.createContainer(buildEndedEvent.data.containerId, buildEndedEvent.data.imageName);
      }
    }
  }
}

export default EventsObserver;