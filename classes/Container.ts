import AppInstanceModel from '../modules/models/appInstance.model';
import { ContainerTable } from '../modules/models/tables';

class Container {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  start() {

  }

  stop() {

  }

  remove() {

  }

  getData(): Promise<ContainerTable> {
    return AppInstanceModel.getContainer(this.id);
  }

  getDevices() {
    
  }

  shellCommand(command: string) {
  }
}

export default Container;