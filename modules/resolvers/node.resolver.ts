/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { resolver } from '../../types';
import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../events/eventsObserver';
import packageFile from '../../package.json';
import MegapolosNode from '../../classes/Node';
import User from '../../classes/User';
import Container from '../../classes/Container';
import { ContainerTable, NodeTable } from '../models/tables';

const nodeModule = createModule({
  id: 'node-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      scalar DateTime

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
        removeNode(id: String!): Boolean
        editNode(id: String! node: NodeInput): Node
        shellCommand(command: String! containerId: String): ShellCommandResult
        shellCommandStart(command: String! containerId: String): String
        updateNode(id: String! init: Boolean withRebuild: Boolean): Boolean
        initNode(id: String!): Boolean
        prepareNodeForCore(id: String!): Boolean
        installRegistryToNode(id: String!): Boolean
      }

      type Node {
        id: String
        name: String
        host: String
        cpu: String
        memory: String
        user: String
        password: String
        life_status: String
        create_date: DateTime
        update_data: DateTime
        remove_date: DateTime
        containers: [Container]
        runningContainers: [String]
        last_update_date: DateTime
      }

      input NodeInput {
        user: String
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
      getNodes: resolver<void, NodeTable[]>(async (parent, args, context, info) => {
        return MegapolosNode.getNodesData();
      }),
      getNode: resolver<{ id: string }, NodeTable>(async (parent, args, context, info) => {
        return new MegapolosNode(args.id).getData();
      }),
    },
    Mutation: {
      createNode: resolver<{ node: NodeTable }, NodeTable>(async (parent, args, context, info) => {
        return (await MegapolosNode.createNode(args.node)).getData();
      }),
      removeNode: resolver<{ id: string }, Boolean>(async (parent, args, context, info) => {
        const node = new MegapolosNode(args.id);
        await node.delete();
        return true;
      }),
      editNode: resolver<{ id: string, node: NodeTable }, NodeTable>(async (parent, args, context, info) => {
        const node = new MegapolosNode(args.id);
        return node.edit(args.node);
      }),
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
      updateNode: resolver<{ id: string, init: boolean, withRebuild: boolean }, boolean>(async (parent, args, context, info) => {
        const node = new MegapolosNode(args.id);
        node.update(args.init, args.withRebuild);
        return true;
      }),
      initNode: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        const node = new MegapolosNode(args.id);
        await node.init();
        return true;
      }),
      prepareNodeForCore: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        const node = new MegapolosNode(args.id);
        await node.prepareForCore();
        return true;
      }),
      installRegistryToNode: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        const node = new MegapolosNode(args.id);
        await node.installRegistry();
        return true;
      }),
    },
    Node: {
      containers: resolver<NodeTable, ContainerTable[]>(async (parent, args, context, info) => {
        return new MegapolosNode(parent.id).getContainers();
      }),
      runningContainers: resolver<NodeTable, string[]>(async (parent, args, context, info) => {
        return new MegapolosNode(parent.id).getDockerContainers();
      }),
    },
  },
});

export default nodeModule;