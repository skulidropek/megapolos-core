import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import EventsObserver from '../modules/events/eventsObserver';
import User from './User';
import Process from './Process';
import BaseProcess from './BaseProcess';
import AppInstanceModel from '../modules/models/appInstance.model';
import Container from './Container';
import docker from '../coreDocker';
import DockerEvent from '../modules/events/docker.event';

function asyncSpawn(command:string, onoutput, onerror): Promise<{ stdout: string, stderr: string, code: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell: 'bash',
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (data) => {
      stdout += data.toString();
      onoutput(data.toString());
    });
    child.stderr.on('data', (data) => {
      stderr += data.toString();
      onerror(data.toString());
    });
    child.on('close', (code) => {
      if (code) {
        reject({
          stdout,
          stderr,
          code,
        });
      } else {
        resolve({
          stdout,
          stderr,
          code });
      }
    });
  });
}

class MegapolosNode {

  commands: { [key: string]: BaseProcess } = {};

  static currentNode: MegapolosNode;

  static createCurrentNode() {
    MegapolosNode.currentNode = new MegapolosNode();
  }

  async restoreContainers() {
    const containers = await AppInstanceModel.getContainers();
    for (let i in containers) {
      const container = new Container(containers[i].id);
      await container.restore();
    }

    EventsObserver.listener({ 'type': 'restoreContainers' });
  }

  async dockerEvents() {
    docker.getEvents({}, function (err, data) {
      if (err) {
        console.error(err.message);
      } else {
        data.on('data', function (chunk) {
          EventsObserver.listener<DockerEvent>({
            type: 'DockerEvent',
            data: JSON.parse(chunk.toString('utf8')),
          });           
        });
      } 
    });

    EventsObserver.listener({ 'type': 'dockerEvents' });
  }
  
  shellCommand(command: string, user: User): { id: string, output: Promise<{ stdout: string, stderr: string }> } {
    const commandId = uuidv4();
    return { id: commandId, output: (async () => {
      const process = new Process(command, user);
      this.commands[commandId] = process;
      const osUserId = (await (user.getData())).os_user_id;
      if (!osUserId) {
        throw new Error('No os user id');
      }
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
}

export default MegapolosNode;