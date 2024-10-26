/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { AppInput, AppInstanceInput, AppInstanceResult, ContainerResult, resolver } from '../../types';
import { AppTable, DeviceTable, ImageTable, RepositoryTable } from '../models/tables';
import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../events/eventsObserver';
import App from '../../classes/App';
import Instance from '../../classes/Instance';
import Container from '../../classes/Container';
import Image from '../../classes/Image';
import Repository from '../../classes/Repository';

const appModule = createModule({
  id: 'app-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type App {
        id: String
        name: String
        owner_user_id: String
        status: String
        create_date: DateTime
        update_date: DateTime
        images: [Image]
      }
      input AppInput {
        name: String!
        images: [ImageInput!]
      }

      type Query {
        getApps: [App]
        getApp(id: String): App
      }

      type Mutation {
        installApp(input: AppInput!): Boolean
        uninstallApp(id: String!): Boolean
        editApp(id: String! name: String!): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getApps: resolver<void, (AppTable & { images?: ImageTable[] })[]>(async (parent, args, context, info) => {
        return new App().getAll();
      }),
      getApp: resolver<{ id: string }, (AppTable & { images?: ImageTable[] })>(async (parent, args, context, info) => {
        return new App(args.id).getData();
      }),
    },
    Mutation: {
      installApp: resolver<{ input: AppInput }, boolean>(async (parent, args, context, info) => {
        await new App().installApp(context.user.id, args.input);
        EventsObserver.listener({ type: 'installApp', data: args });
        return true;
      }),
      uninstallApp: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        await new App(args.id).delete();
        EventsObserver.listener({ type: 'uninstallApp', data: args });
        return true;
      }),
      editApp: resolver<{ id: string, name: string }, boolean>(async (parent, args, context, info) => {
        await new App(args.id).edit({ name: args.name });
        EventsObserver.listener({ type: 'editApp', data: args });
        return true;
      }),
    },
    App: {
      images: resolver<AppTable & { images?: ImageTable[] }, ImageTable[]>(async (parent, args, context, info) => {
        const app = new App(parent.id);
        return app.getImages();
      }),
    },
  },
});

export default appModule;