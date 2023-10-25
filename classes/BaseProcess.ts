abstract class BaseProcess {
  command: string;

  code: number;

  stdout: string = '';

  stderr: string = '';

  status = 'init';

  onoutput: (data: string) => void;

  onerror: (data: string) => void;

  abstract start(): Promise<void>;
}

export default BaseProcess;