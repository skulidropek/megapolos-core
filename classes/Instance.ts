import Container from './Container';

class Instance {
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