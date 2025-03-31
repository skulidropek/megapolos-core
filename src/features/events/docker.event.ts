/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { MegapolosEvent } from './event';

interface DockerEvent extends MegapolosEvent {
  type: 'DockerEvent';
  data: any;
}

export default DockerEvent;
