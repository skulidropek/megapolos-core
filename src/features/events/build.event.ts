/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { MegapolosEvent } from './event';

export interface BuildEndedEvent extends MegapolosEvent {
  type: 'buildEnded';
  data: {
    imageName: string;
    containerId: string;
  };
}
