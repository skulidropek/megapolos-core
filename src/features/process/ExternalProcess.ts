import BaseProcess, { ProcessStatus } from './BaseProcess';
import { Client } from 'ssh2';
import NodeRepo from '../repository/megapolos.node.repository';

class ExternalProcess extends BaseProcess {
  node: NodeRepo;

  onoutput: (data: string) => void;

  onerror: (data: string) => void;

  constructor(command: string, node: NodeRepo) {
    super();
    this.command = command;
    this.node = node;
  }

  async start(): Promise<void> {
    this.status = ProcessStatus.Running;
    const data = await this.node.getEntity();
    return new Promise((resolve, reject) => {
      const conn = new Client();
      conn
        .on('ready', () => {
          console.log('Client :: ready');
          conn.exec(this.command, (err, stream) => {
            if (err) throw err;
            stream
              .on('close', (code) => {
                if (code) {
                  this.status = ProcessStatus.Error;
                  this.code = code;
                  reject({
                    stdout: this.stdout,
                    stderr: this.stderr,
                    code,
                  });
                } else {
                  this.status = ProcessStatus.Finished;
                  resolve();
                }
                conn.end();
              })
              .on('data', (chunk) => {
                this.stdout += chunk.toString();
                this.onoutput(chunk.toString());
              })
              .stderr.on('data', (chunk) => {
                this.stderr += chunk.toString();
                this.onerror(chunk.toString());
              });
          });
        })
        .on('error', (err) => {
          this.status = ProcessStatus.Error;
          reject(err);
        })
        .connect({
          host: data.host,
          port: 22,
          username: data.user,
          password: data.password,
        });
    });
  }
}

export default ExternalProcess;
