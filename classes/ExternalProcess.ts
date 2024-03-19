import { spawn } from 'child_process';
import User from './User';
import BaseProcess, { ProcessStatus } from './BaseProcess';
import MegapolosNode from './Node';
import { Client } from 'ssh2';

class ExternalProcess extends BaseProcess {

  node: MegapolosNode;

  onoutput: (data: string) => void;

  onerror: (data: string) => void;

  constructor(command: string, node: MegapolosNode) {
    super();
    this.command = command;
    this.node = node;
  }

  async start(): Promise<void> {
    this.status = ProcessStatus.Running;
    const data = await this.node.getData();
    return new Promise((resolve, reject) => {

      const conn = new Client();
      conn.on('ready', () => {
        console.log('Client :: ready');
        conn.exec(this.command, (err, stream) => {
          if (err) throw err;
          stream.on('close', (code, signal) => {
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
          }).on('data', (data) => {
            this.stdout += data.toString();
            this.onoutput(data.toString());
          }).stderr.on('data', (data) => {
            this.stderr += data.toString();
            this.onerror(data.toString());
          });
        });
      }).connect({
        host: data.host,
        port: 22,
        username: data.user,
        password: data.password,
      });
    });
  }
}

export default ExternalProcess;