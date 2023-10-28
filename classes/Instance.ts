import EventsObserver from '../modules/events/eventsObserver';
import AppInstanceModel from '../modules/models/appInstance.model';
import { AppInstanceInput } from '../types';
import Container from './Container';

class Instance {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
  
  static async createInstance(input: AppInstanceInput): Promise<Instance> {
  }

  async start() {
    const containers = await this.getContainers();
    for (const i in containers) {
      const container = containers[i];
      await container.start();
    }

    await AppInstanceModel.updateAppInstanceLifeStatus(this.id, 'running');

    EventsObserver.listener({ 'type': 'startAppInstance', data:{ id: this.id } });
  }

  async stop() {
    const containers = await this.getContainers();
    for (const i in containers) {
      const container = containers[i];
      await container.stop();
    }

    await AppInstanceModel.updateAppInstanceLifeStatus(this.id, 'stopped');

    EventsObserver.listener({ 'type': 'stopAppInstance', data:{ id: this.id } });
  }

  async remove() {
    const containers = await this.getContainers();
    containers.forEach(container => {
      container.remove();
    });
  }

  async getContainers(): Promise<Container[]> {
    return (await AppInstanceModel.getAppInstanceContainers(this.id)).map((container) => new Container(container.id));
  }

}

export default Instance;