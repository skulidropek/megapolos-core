import { spawn } from 'child_process';
import { promisify } from 'util';
const exec = promisify(require('child_process').exec);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { resolver } from '../../types';
import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../events/eventsObserver';
import packageFile from '../../package.json';

function asyncSpawn(command:string, onoutput, onerror): Promise<{ stdout: string, stderr: string, code: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell: true,
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
        shellCommand(command: String!): ShellCommandResult
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
      resolver<{ command: string }, { stdout: string, stderr: string }>(async (parent, args, context, info) => {
        const osUserId = context.user.os_user_id;
        if (!osUserId) {
          throw new Error('No os user id');
        }
        const command = args.command;
        EventsObserver.listener({ type: 'shellCommandStarted', data: args });
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
      }),
    },
  },
});

export default nodeModule;