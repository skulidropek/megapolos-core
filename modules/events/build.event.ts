export interface BuildEndedEvent extends Event {
  type: 'buildEnded';
  data: {
    imageName: string;
    containerId: string;
  }
}