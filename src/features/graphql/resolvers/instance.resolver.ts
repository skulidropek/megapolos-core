/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import Instance from '../../repository/Instance';
import {
  AppInstanceResult,
  resolver,
} from '../../../domain/types';
import EventsObserver from '../events/eventsObserver';
import {
  AppInstanceTable,
  ContainerTable,
} from '../../db/tables';

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
        async (parent, args, context) => {
          return new Instance(context).getAll();
        },
      ),
      getAppInstance: resolver<{ id: string }, AppInstanceResult>(
        async (parent, args, context) => {
          return new Instance(context, args.id).getData();
        },
      ),
    },
    Mutation: {
      createAppInstance: resolver<{ input: AppInstanceTable }, boolean>(
        async (parent, args, context) => {
          await new Instance(context).create(args.input);
          EventsObserver.listener({ type: 'createAppInstance', data: args });
          return true;
        },
      ),
      startAppInstance: resolver<{ id: string }, boolean>(
        async (parent, args, context) => {
          await new Instance(context, args.id).start();
          EventsObserver.listener({ type: 'startAppInstance', data: args });
          return true;
        },
      ),
      stopAppInstance: resolver<{ id: string }, boolean>(
        async (parent, args, context) => {
          await new Instance(context, args.id).stop();
          EventsObserver.listener({ type: 'stopAppInstance', data: args });
          return true;
        },
      ),
      restartAppInstance: resolver<{ id: string }, boolean>(
        async (parent, args, context) => {
          await new Instance(context, args.id).stop();
          await new Instance(context, args.id).start();
          EventsObserver.listener({ type: 'startAppInstance', data: args });
          return true;
        },
      ),
      removeAppInstance: resolver<{ id: string }, boolean>(
        async (parent, args, context) => {
          await new Instance(context, args.id).delete();
          EventsObserver.listener({ type: 'removeAppInstance', data: args });
          return true;
        },
      ),
      editAppInstance: resolver<{ id: string; name: string }, boolean>(
        async (parent, args, context) => {
          await new Instance(context, args.id).edit({ name: args.name });
          EventsObserver.listener({ type: 'editAppInstance', data: args });
          return true;
        },
      ),
      buildAppInstance: resolver<{ id: string }, boolean>(
        async (parent, args, context) => {
          await new Instance(context, args.id).build();
          EventsObserver.listener({ type: 'buildAppInstance', data: args });
          return true;
        },
      ),
    },
    AppInstance: {
      containers: resolver<AppInstanceResult, ContainerTable[]>(
        async (parent, args, context) => {
          const instance = new Instance(context, parent.id);
          return instance.getContainers();
        },
      ),
    },
  },
});

export default instanceModule;
