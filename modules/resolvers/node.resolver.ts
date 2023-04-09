import { spawn } from 'child_process';
import { promisify } from 'util';
const exec = promisify(require('child_process').exec);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { resolver } from '../../types';
import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../events/eventsObserver';
import packageFile from '../../package.json';
import docker from '../../coreDocker';
import AppInstanceAction from '../actions/appInstance.action';
import AppInstanceModel from '../models/appInstance.model';

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

function asyncContainerSpawn(command: string, dockerRuntimeId: string, onoutput, onerror): Promise<{ stdout: string, stderr: string, code: number }> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    docker.getContainer(dockerRuntimeId).exec({
      Cmd: ['bash', '-c', '--', command],
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
          stdout += data.toString();
          onoutput(data.toString());
        });
        stream.on('error', (data) => {
          stderr += data.toString();
          onerror(data.toString());
        });
        stream.on('end', (data) => {
          console.log(data);
          resolve({
            stdout,
            stderr,
            code: 0 });
        });
      });
    });
  });
}
const nodeModule = createModule({
  id: 'node-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type ShellCommandResult {
        stdout: String
        stderr: String
      }

      type Query {
        version: String
      }
      type Mutation {
        shellCommand(command: String! containerId: String): ShellCommandResult
      }
    `,
  ],
  resolvers: {
    Query: {
      version: resolver<void, string>(async (parent, args, context, info) => {
        return packageFile.version;
      }),
    },
    Mutation: {
      shellCommand: 
      resolver<{ command: string, containerId: string }, { stdout: string, stderr: string }>(async (parent, args, context, info) => {
        const command = args.command;
        EventsObserver.listener({ type: 'shellCommandStarted', data: args });
        if (!args.containerId) {
          const osUserId = context.user.os_user_id;
          if (!osUserId) {
            throw new Error('No os user id');
          }
          const result = await asyncSpawn(command, (data) => {
            EventsObserver.listener({ type: 'shellCommandOutput', data: data });
          }, (data) => {
            EventsObserver.listener({ type: 'shellCommandError', data: data });
          });

          // const result = await exec(command,
          // // , { uid: parseInt(osUserId) }
          // );
          EventsObserver.listener({ type: 'shellCommand', data: args });
          return result;
        } else {
          const container = await AppInstanceModel.getContainer(args.containerId);
          const result = await asyncContainerSpawn(args.command, container.docker_runtime_id, (data) => {
            EventsObserver.listener({ type: 'shellCommandOutput', data: data });
          }, (data) => {
            EventsObserver.listener({ type: 'shellCommandError', data: data });
          });
          return result;
        }
      }),
    },
  },
});

export default nodeModule;