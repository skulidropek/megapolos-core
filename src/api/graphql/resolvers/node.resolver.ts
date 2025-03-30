/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { resolver } from '../../../domain/types';
import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../../../features/events/eventsObserver';
import packageFile from '../../../../package.json';
import MegapolosNode from '../../../features/repository/Node';
import User from '../../../features/repository/user/User';
import Container from '../../../features/repository/container/Container';
import { ContainerTable, NodeTable } from '../../../features/db/tables';

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
        shellCommand(command: String! containerId: String nodeId: String): ShellCommandResult
        shellCommandStart(command: String! containerId: String nodeId: String): String
        updateNode(id: String! init: Boolean withRebuild: Boolean): Boolean
        updateNodes(nodeIds: [String]!): Boolean
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
        ip: String
        docker_mirrors: [String]
      }

      input NodeInput {
        user: String
        name: String
        host: String
        password: String
        docker_mirrors: [String]
      }
    `,
  ],
  resolvers: {
    Query: {
      version: resolver<void, string>(async () => {
        return packageFile.version;
      }),
      getShellCommandStatus: resolver<{ id: string }, string>(async (parent, args) => {
        // return commands[args.id] ? 'running' : '';
        return MegapolosNode.currentNode.commands[args.id].status;
      }),
      getNodes: resolver<void, NodeTable[]>(async (parent, args, context) => {
        return new MegapolosNode(context).getAll();
      }),
      getNode: resolver<{ id: string }, NodeTable>(async (parent, args, context) => {
        return new MegapolosNode(context, args.id).getData();
      }),
    },
    Mutation: {
      createNode: resolver<{ node: NodeTable }, NodeTable>(async (parent, args, context) => {
        return new MegapolosNode(context).create(args.node);
      }),
      removeNode: resolver<{ id: string }, Boolean>(async (parent, args, context) => {
        const node = new MegapolosNode(context, args.id);
        await node.delete();
        return true;
      }),
      editNode: resolver<{ id: string, node: NodeTable }, NodeTable>(async (parent, args, context) => {
        const node = new MegapolosNode(context, args.id);
        return node.edit(args.node);
      }),
      shellCommand: resolver<{ command: string, containerId: string, nodeId: string }, { stdout: string, stderr: string }>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'shellCommandStarted', data: args });
        // return shellCommand(args.command, args.containerId, context.user);
        if (args.containerId) {
          const container = new Container(context, args.containerId);
          return container.shellCommand(args.command).output;
        } else if (args.nodeId) {
          return new MegapolosNode(context, args.nodeId).shellCommand(args.command, new User(context, context.user.id)).output;
        } else {
          return MegapolosNode.currentNode.shellCommand(args.command, new User(context, context.user.id)).output;
        }
      }),
      shellCommandStart: resolver<{ command: string, containerId: string, nodeId: string }, string>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'shellCommandStarted', data: args });
        if (args.containerId) {
          const container = new Container(context, args.containerId);
          const result = container.shellCommand(args.command);
          return result.id;
        } else if (args.nodeId) {
          const result = new MegapolosNode(context, args.nodeId).shellCommand(args.command, new User(context, context.user.id));
          return result.id;
        } else {
          const result = MegapolosNode.currentNode.shellCommand(args.command, new User(context, context.user.id));
          return result.id;
        }
        // const commandId = uuidv4();
        // shellCommand(args.command, args.containerId, context.user, commandId);
      }),
      updateNode: resolver<{ id: string, init: boolean, withRebuild: boolean }, boolean>(async (parent, args, context) => {
        const node = new MegapolosNode(context, args.id);
        node.update(args.init, args.withRebuild);
        return true;
      }),
      updateNodes: resolver<{ nodeIds: string[] }, boolean>(async (parent, args, context) => {
        (async () => {
          for (let i in args.nodeIds) {
            const nodeId = args.nodeIds[i];
            const node = new MegapolosNode(context, nodeId);
            await node.update();
          }
        })();
        return true;
      }),
      initNode: resolver<{ id: string }, boolean>(async (parent, args, context) => {
        const node = new MegapolosNode(context, args.id);
        await node.init();
        return true;
      }),
      prepareNodeForCore: resolver<{ id: string }, boolean>(async (parent, args, context) => {
        const node = new MegapolosNode(context, args.id);
        await node.prepareForCore();
        return true;
      }),
      installRegistryToNode: resolver<{ id: string }, boolean>(async (parent, args, context) => {
        const node = new MegapolosNode(context, args.id);
        await node.installRegistry();
        return true;
      }),
    },
    Node: {
      containers: resolver<NodeTable, ContainerTable[]>(async (parent, args, context) => {
        return new MegapolosNode(context, parent.id).getContainers();
      }),
      runningContainers: resolver<NodeTable, string[]>(async (parent, args, context) => {
        return new MegapolosNode(context, parent.id).getDockerContainers();
      }),
      ip: resolver<NodeTable, string>(async (parent, args, context) => {
        return new MegapolosNode(context, parent.id).getIp();
      }),
    },
  },
});

export default nodeModule;