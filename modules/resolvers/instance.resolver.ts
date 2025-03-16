/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import Instance from '../../classes/Instance';
import {
  AppInstanceResult,
  resolver,
} from '../../types';
import EventsObserver from '../events/eventsObserver';
import {
  AppInstanceTable,
  ContainerTable,
} from '../models/tables';

const instanceModule = createModule({
  id: 'instance-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type AppInstance {
        id: String
        name: String
        user_id: String
        life_status: String
        app_instance_url: String
        app_id: String
        instance_type_id: String
        deploy_strategy_id: String
        remove_strategy_id: String
        create_date: DateTime
        update_date: DateTime
        remove_date: DateTime
        containers: [Container]
      }

      input AppInstanceInput {
        app_id: String,
        name: String,
      }

      type Query {
        getAppInstances: [AppInstance]
        getAppInstance(id: String): AppInstance
      }

      type Mutation {
        createAppInstance(input: AppInstanceInput!): Boolean
        startAppInstance(id: String!): Boolean
        stopAppInstance(id: String!): Boolean
        restartAppInstance(id: String!): Boolean
        removeAppInstance(id: String!): Boolean
        editAppInstance(id: String! name: String!): Boolean
        buildAppInstance(id: String!): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getAppInstances: resolver<void, AppInstanceResult[]>(
        async (parent, args, context, info) => {
          return new Instance(undefined, context.user.id).getAll();
        },
      ),
      getAppInstance: resolver<{ id: string }, AppInstanceResult>(
        async (parent, args, context, info) => {
          return new Instance(args.id, context.user.id).getData();
        },
      ),
    },
    Mutation: {
      createAppInstance: resolver<{ input: AppInstanceTable }, boolean>(
        async (parent, args, context, info) => {
          await new Instance(undefined, context.user.id).create(args.input);
          EventsObserver.listener({ type: 'createAppInstance', data: args });
          return true;
        },
      ),
      startAppInstance: resolver<{ id: string }, boolean>(
        async (parent, args, context, info) => {
          await new Instance(args.id, context.user.id).start();
          EventsObserver.listener({ type: 'startAppInstance', data: args });
          return true;
        },
      ),
      stopAppInstance: resolver<{ id: string }, boolean>(
        async (parent, args, context, info) => {
          await new Instance(args.id, context.user.id).stop();
          EventsObserver.listener({ type: 'stopAppInstance', data: args });
          return true;
        },
      ),
      restartAppInstance: resolver<{ id: string }, boolean>(
        async (parent, args, context, info) => {
          await new Instance(args.id, context.user.id).stop();
          await new Instance(args.id, context.user.id).start();
          EventsObserver.listener({ type: 'startAppInstance', data: args });
          return true;
        },
      ),
      removeAppInstance: resolver<{ id: string }, boolean>(
        async (parent, args, context, info) => {
          await new Instance(args.id, context.user.id).delete();
          EventsObserver.listener({ type: 'removeAppInstance', data: args });
          return true;
        },
      ),
      editAppInstance: resolver<{ id: string; name: string }, boolean>(
        async (parent, args, context, info) => {
          await new Instance(args.id, context.user.id).edit({ name: args.name });
          EventsObserver.listener({ type: 'editAppInstance', data: args });
          return true;
        },
      ),
      buildAppInstance: resolver<{ id: string }, boolean>(
        async (parent, args, context, info) => {
          await new Instance(args.id, context.user.id).build();
          EventsObserver.listener({ type: 'buildAppInstance', data: args });
          return true;
        },
      ),
    },
    AppInstance: {
      containers: resolver<AppInstanceResult, ContainerTable[]>(
        async (parent, args, context, info) => {
          const instance = new Instance(parent.id, context.user.id);
          return instance.getContainers();
        },
      ),
    },
  },
});

export default instanceModule;
