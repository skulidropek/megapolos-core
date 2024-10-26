/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import Container from '../../classes/Container';
import pubsub from '../../pubsub';
import { BuildEndedEvent } from './build.event';
import DockerEvent from './docker.event';
import { MegapolosEvent } from './event';

class EventsObserver {

  static async getIterator() {
    return pubsub.asyncIterator(['EVENT']);
  }

  static async listener<T = MegapolosEvent>(event: T) {
    pubsub.publish('EVENT', { event });
    switch ((event as MegapolosEvent).type) {
      case 'DockerEvent': {
        const dockerEvent = event as DockerEvent;
        // console.log(dockerEvent.data);
      }
    }
  }
}

export default EventsObserver;