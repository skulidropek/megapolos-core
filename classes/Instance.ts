import { AppInstanceInput } from '../types';
import Container from './Container';

class Instance {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
  
  static async createInstance(input: AppInstanceInput): Promise<Instance> {
  }

  start() {
    const containers = this.getContainers();
    containers.forEach(container => {
      container.start();
    });
  }

  stop() {
    const containers = this.getContainers();
    containers.forEach(container => {
      container.stop();
    });
  }

  remove() {
    const containers = this.getContainers();
    containers.forEach(container => {
      container.remove();
    });
  }

  getContainers(): Container[] {
    
  }

}

export default Instance;