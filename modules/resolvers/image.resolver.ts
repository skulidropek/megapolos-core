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

const imageModule = createModule({
  id: 'image-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type Image {
        id: String
        name: String
        app_id: String
        image: String
        inner_port: Int
        has_state: Int
        tags: String
        create_date: String
        update_date: String
        commit_id: String
        status: String
        repository: Repository
        branch: String
      }
      input ImageInput {
        name: String
        image: String
        inner_port: Int
        repository_id: String
        branch: String
      }

      type Mutation {
        addImage(appId: String! image: ImageInput!): Boolean
        buildImage(imageId: String!): Boolean
        editImage(id: String! name: String! image: String! inner_port: Int!): Boolean
        removeImage(id: String!): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
    },
    Mutation: {
      editImage: resolver<{ id: string, name: string, image: string, inner_port: number }, boolean>(async (parent, args, context, info) => {
        await new Image(args.id).edit(args);
        EventsObserver.listener({ type: 'editImage', data: args });
        return true;
      }),
      addImage: resolver<{ appId: string, image: ImageTable }, boolean>(async (parent, args, context, info) => {
        await new App(args.appId).addImage(args.image);
        EventsObserver.listener({ type: 'addImage', data: args });
        return true;
      }),
      removeImage: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        await new Image(args.id).remove();
        EventsObserver.listener({ type: 'removeImage', data: args });
        return true;
      }),
      buildImage: resolver<{ imageId: string }, boolean>(async (parent, args, context, info) => {
        await new Image(args.imageId).build(context.user.id);
        EventsObserver.listener({ type: 'buildImage', data: args });
        return true;
      }),
    },
    Image: {
      repository: resolver<ImageTable, RepositoryTable>(async (parent, args, context, info) => {
        return new Repository(parent.repository_id).getData();
      }),
    },
  },
});

export default imageModule;