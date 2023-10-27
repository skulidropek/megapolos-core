import { spawn } from 'child_process';
import User from './User';
import docker from '../coreDocker';
import Container from './Container';
import BaseProcess, { ProcessStatus } from './BaseProcess';

class ContainerProcess extends BaseProcess {
  user: User;

  container: Container;

  constructor(command: string, container: Container) {
    super();
    this.command = command;
    this.container = container;
  }

  async start(): Promise<void> {
    this.status = ProcessStatus.Running;
    return new Promise(async (resolve, reject) => {
      (await this.container.getDockerContainer()).exec({
        Cmd: ['bash', '-c', '--', this.command],
        AttachStdout: true,
        AttachStderr: true,
      }, (err, exec) => {
        if (err) {
          reject(err);
          return;
        }
        exec.start({}, (err, stream) => {
          if (err) {
            reject(err);
            return;
          }
          stream.on('data', (data) => {
            this.stdout += data.toString();
            this.onoutput(data.toString());
          });
          stream.on('error', (data) => {
            this.status = ProcessStatus.Error;
            this.stderr += data.toString();
            this.onerror(data.toString());
          });
          stream.on('end', (data) => {
            this.status = ProcessStatus.Finished;
            console.log(data);
            resolve();
          });
        });
      });
    });
  }
}

export default ContainerProcess;