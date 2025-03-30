export enum ProcessStatus {
  Init = 'init',
  Running = 'running',
  Finished = 'finished',
  Error = 'error',
}

abstract class BaseProcess {
  command: string;

  code: number;

  stdout: string = '';

  stderr: string = '';

  status: ProcessStatus = ProcessStatus.Init;

  onoutput: (data: string) => void;

  onerror: (data: string) => void;

  abstract start(): Promise<void>;
}

export default BaseProcess;