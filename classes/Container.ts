import { v4 as uuidv4 } from 'uuid';
import docker from '../coreDocker';
import AppInstanceModel from '../modules/models/appInstance.model';
import { ContainerTable } from '../modules/models/tables';
import EventsObserver from '../modules/events/eventsObserver';
import ContainerProcess from './ContainerProcess';
import MegapolosNode from './Node';

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

  async getDockerContainer() {
    return docker.getContainer((await this.getData()).docker_runtime_id);
  }

  getDevices() {
    
  }

  shellCommand(command: string): { id: string, output: Promise<{ stdout: string, stderr: string }> } {
    const commandId = uuidv4();
    return { id: commandId, output: (async () => {
      const process = new ContainerProcess(command, this);
      MegapolosNode.currentNode.commands[commandId] = process;
      process.onoutput = (data) => {
        EventsObserver.listener({ type: 'shellCommandOutput', data: data });
      };
      process.onerror = (data) => {
        EventsObserver.listener({ type: 'shellCommandError', data: data });
      };

      await process.start();

      const result = {
        stdout: process.stdout,
        stderr: process.stderr,
      };
    
      // const result = await exec(command,
      // // , { uid: parseInt(osUserId) }
      // );
      return result;
    })() };
  }

  addVolume() {

  }

  removeVolume() {
    
  }

  build() {

  }

  update() {
  }
}

export default Container;