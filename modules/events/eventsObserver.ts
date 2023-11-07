/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import Container from '../../classes/Container';
import ContainerCreate from '../../classes/ContainerCreate';
import pubsub from '../../pubsub';
import AppInstanceAction from '../actions/appInstance.action';
import AppModel from '../models/app.model';
import AppInstanceModel from '../models/appInstance.model';
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
      case 'buildEnded': {
        const buildEndedEvent = event as BuildEndedEvent;
        const containerId = buildEndedEvent.data.containerId;
        const container = new Container(containerId);
        const containerCreate = new ContainerCreate();
        await containerCreate.createContainerAfterBuild(container);
      }
      case 'DockerEvent': {
        const dockerEvent = event as DockerEvent;
        // console.log(dockerEvent.data);
      }
    }
  }
}

export default EventsObserver;