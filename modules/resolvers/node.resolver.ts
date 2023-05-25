/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { spawn } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
const exec = promisify(require('child_process').exec);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { resolver } from '../../types';
import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../events/eventsObserver';
import packageFile from '../../package.json';
import docker from '../../coreDocker';
import AppInstanceAction from '../actions/appInstance.action';
import AppInstanceModel from '../models/appInstance.model';
import { UserTable } from '../models/tables';

const commands = {};

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

const shellCommand = async (command: string, containerId: string, user: UserTable, commandId?: string): Promise<{ stdout: string, stderr: string }> => {
  if (!commandId) {
    commandId = uuidv4();
  }
  commands[commandId] = {
    command,
    containerId,
  };
  if (!containerId) {
    const osUserId = user.os_user_id;
    if (!osUserId) {
      delete commands[commandId];
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
    delete commands[commandId];
    return result;
  } else {
    const container = await AppInstanceModel.getContainer(containerId);
    const result = await asyncContainerSpawn(command, container.docker_runtime_id, (data) => {
      EventsObserver.listener({ type: 'shellCommandOutput', data: data });
    }, (data) => {
      EventsObserver.listener({ type: 'shellCommandError', data: data });
    });
    delete commands[commandId];
    return result;
  }
};

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
        getShellCommandStatus(id: String!): String
      }
      type Mutation {
        shellCommand(command: String! containerId: String): ShellCommandResult
        shellCommandStart(command: String! containerId: String): String
      }
    `,
  ],
  resolvers: {
    Query: {
      version: resolver<void, string>(async (parent, args, context, info) => {
        return packageFile.version;
      }),
      getShellCommandStatus: resolver<{ id: string }, string>(async (parent, args, context, info) => {
        return commands[args.id] ? 'running' : '';
      }),
    },
    Mutation: {
      shellCommand: resolver<{ command: string, containerId: string }, { stdout: string, stderr: string }>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'shellCommandStarted', data: args });
        return shellCommand(args.command, args.containerId, context.user);
      }),
      shellCommandStart: resolver<{ command: string, containerId: string }, string>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'shellCommandStarted', data: args });
        const commandId = uuidv4();
        shellCommand(args.command, args.containerId, context.user, commandId);
        return commandId;
      }),
    },
  },
});

export default nodeModule;