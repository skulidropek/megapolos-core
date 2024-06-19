import { spawn } from 'child_process';
import User from './User';
import docker from '../coreDocker';
import Container from './Container';
import BaseProcess, { ProcessStatus } from './BaseProcess';
import { Writable } from 'stream';

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
      const container = await this.container.getDockerContainer();
      container.exec({
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
          const stdout = new Writable({ write: (chunk, encoding, callback) => {
            this.stdout += chunk.toString();
            this.onoutput(chunk.toString());
          } });
          const stderr = new Writable({ write: (chunk, encoding, callback) => {
            this.stderr += chunk.toString();
            this.onerror(chunk.toString());
          } });
          container.modem.demuxStream(stream, stdout, stderr);
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