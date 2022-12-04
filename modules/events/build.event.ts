import { MegapolosEvent } from './event';

export interface BuildEndedEvent extends MegapolosEvent {
  type: 'buildEnded';
  data: {
    imageName: string;
    containerId: string;
  }
}