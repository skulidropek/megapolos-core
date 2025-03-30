import User from '../repository/user/User';
import Container from '../repository/container/Container';
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
        exec.start({}, (error, stream) => {
          if (error) {
            reject(error);
            return;
          }
          const stdout = new Writable({ write: (chunk) => {
            this.stdout += chunk.toString();
            this.onoutput(chunk.toString());
          } });
          const stderr = new Writable({ write: (chunk) => {
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