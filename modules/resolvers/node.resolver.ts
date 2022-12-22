import { promisify } from 'util';
const exec = promisify(require('child_process').exec);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { resolver } from '../../types';
import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../events/eventsObserver';

const nodeModule = createModule({
  id: 'node-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type ShellCommandResult {
        stdout: String
        stderr: String
      }

      type Mutation {
        shellCommand(command: String!): ShellCommandResult
      }
    `,
  ],
  resolvers: {
    Mutation: {
      shellCommand: 
      resolver<{ command: string }, { stdout: string, stderr: string }>(async (parent, args, context, info) => {
        const osUserId = context.user.os_user_id;
        if (!osUserId) {
          throw new Error('No os user id');
        }
        const command = args.command;
        const result = await exec(command,
        // , { uid: parseInt(osUserId) }
        );
        EventsObserver.listener({ type: 'shellCommand', data: args });
        return result;
      }),
    },
  },
});

export default nodeModule;