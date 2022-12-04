import { MegapolosEvent } from './event';


interface DockerEvent extends MegapolosEvent {
  type: 'DockerEvent';
  data: any;
}

export default DockerEvent;