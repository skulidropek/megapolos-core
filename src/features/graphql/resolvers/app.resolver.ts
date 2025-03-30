/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { AppInput, resolver } from '../../../domain/types';
import { AppTable, ImageTable, RepositoryTable } from '../../db/tables';
import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../events/eventsObserver';
import App from '../../repository/App';

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
        repositories: [Repository]
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
      getApps: resolver<void, (AppTable & { images?: ImageTable[] })[]>(async (parent, args, context) => {
        return new App(context).getAll();
      }),
      getApp: resolver<{ id: string }, (AppTable & { images?: ImageTable[] })>(async (parent, args, context) => {
        return new App(context, args.id).getData();
      }),
    },
    Mutation: {
      installApp: resolver<{ input: AppInput }, boolean>(async (parent, args, context) => {
        await new App(context).installApp(context.user.id, args.input);
        EventsObserver.listener({ type: 'installApp', data: args });
        return true;
      }),
      uninstallApp: resolver<{ id: string }, boolean>(async (parent, args, context) => {
        await new App(context, args.id).delete();
        EventsObserver.listener({ type: 'uninstallApp', data: args });
        return true;
      }),
      editApp: resolver<{ id: string, name: string }, boolean>(async (parent, args, context) => {
        await new App(context, args.id).edit({ name: args.name });
        EventsObserver.listener({ type: 'editApp', data: args });
        return true;
      }),
    },
    App: {
      images: resolver<AppTable & { images?: ImageTable[] }, ImageTable[]>(async (parent, args, context) => {
        const app = new App(context, parent.id);
        return app.getImages();
      }),
      repositories: resolver<AppTable & { images?: ImageTable[] }, RepositoryTable[]>(async (parent, args, context) => {
        const app = new App(context, parent.id);
        return app.getRepositories();
      }),
    },
  },
});

export default appModule;