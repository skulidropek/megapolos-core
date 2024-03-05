/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { resolver } from '../../types';
import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../events/eventsObserver';
import packageFile from '../../package.json';
import MegapolosNode from '../../classes/Node';
import User from '../../classes/User';
import Container from '../../classes/Container';

const nodeModule = createModule({
  id: 'node-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      scalar Date

      type ShellCommandResult {
        stdout: String
        stderr: String
      }

      type Query {
        version: String
        getShellCommandStatus(id: String!): String
        getNodes: [Node]
        getNode(id: String!): Node
      }
      type Mutation {
        createNode(node: NodeInput): Node
        removeNode(id: String!): Node
        editNode(id: String! node: NodeInput): Node
        shellCommand(command: String! containerId: String): ShellCommandResult
        shellCommandStart(command: String! containerId: String): String
      }

      type Node {
        id: String
        name: String
        host: String
        cpu: String
        memory: String
        user: String
        password: String
        lifeStatus: String
        createDate: Date
        updateDate: Date
        removeDate: Date
      }

      input NodeInput {
        name: String
        host: String
        password: String
      }
    `,
  ],
  resolvers: {
    Query: {
      version: resolver<void, string>(async (parent, args, context, info) => {
        return packageFile.version;
      }),
      getShellCommandStatus: resolver<{ id: string }, string>(async (parent, args, context, info) => {
        // return commands[args.id] ? 'running' : '';
        return MegapolosNode.currentNode.commands[args.id].status;
      }),
    },
    Mutation: {
      shellCommand: resolver<{ command: string, containerId: string }, { stdout: string, stderr: string }>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'shellCommandStarted', data: args });
        // return shellCommand(args.command, args.containerId, context.user);
        if (args.containerId) {
          const container = new Container(args.containerId);
          return container.shellCommand(args.command).output;
        } else {
          return MegapolosNode.currentNode.shellCommand(args.command, new User(context.user.id)).output;
        }
      }),
      shellCommandStart: resolver<{ command: string, containerId: string }, string>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'shellCommandStarted', data: args });
        if (args.containerId) {
          const container = new Container(args.containerId);
          const result = container.shellCommand(args.command);
          return result.id;
        } else {
          const result = MegapolosNode.currentNode.shellCommand(args.command, new User(context.user.id));
          return result.id;
        }
        // const commandId = uuidv4();
        // shellCommand(args.command, args.containerId, context.user, commandId);
      }),
    },
  },
});

export default nodeModule;