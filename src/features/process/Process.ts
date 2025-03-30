import { spawn } from 'child_process';
import User from '../repository/user/User';
import BaseProcess, { ProcessStatus } from './BaseProcess';

class Process extends BaseProcess {

  user: User;

  onoutput: (data: string) => void;

  onerror: (data: string) => void;

  constructor(command: string, user: User) {
    super();
    this.command = command;
    this.user = user;
  }

  async start(): Promise<void> {
    this.status = ProcessStatus.Running;
    return new Promise((resolve, reject) => {
      const child = spawn(this.command, {
        shell: 'bash',
        uid: 0,
      });
      child.stdout.on('data', (data) => {
        this.stdout += data.toString();
        this.onoutput(data.toString());
      });
      child.stderr.on('data', (data) => {
        this.stderr += data.toString();
        this.onerror(data.toString());
      });
      child.on('close', (code) => {
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
      });
    });
  }
}

export default Process;