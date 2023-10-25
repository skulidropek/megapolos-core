import { spawn } from 'child_process';
import User from './User';
import BaseProcess from './BaseProcess';

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
    this.status = 'running';
    return new Promise((resolve, reject) => {
      const child = spawn(this.command, {
        shell: 'bash',
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
          this.status = 'error';
          this.code = code;
          reject({
            stdout: this.stdout,
            stderr: this.stderr,
            code,
          });
        } else {
          this.status = 'finished';
          resolve();
        }
      });
    });
  }
}

export default Process;