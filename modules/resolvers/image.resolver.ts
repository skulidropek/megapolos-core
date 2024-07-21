/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { AppInput, AppInstanceInput, AppInstanceResult, ContainerResult, resolver } from '../../types';
import { AppTable, DeviceTable, ImageEnvRequirementTable, ImageTable, RepositoryTable } from '../models/tables';
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
        create_date: DateTime
        update_date: DateTime
        commit_id: String
        status: String
        repository: Repository
        branch: String
        envs: [ImageEnvRequirement]
        last_build_date: DateTime
      }
      input ImageInput {
        name: String
        image: String
        inner_port: Int
        repository_id: String
        branch: String
      }
        
      enum ImageEnvRequirementType {
        string
        number
        boolean
      }

      type ImageEnvRequirement {
        id: String
        image_id: String
        name: String
        env_name: String
        env_default_value: String
        type: ImageEnvRequirementType
      }

      input ImageEnvRequirementInput {
        name: String
        env_name: String
        env_default_value: String
        type: ImageEnvRequirementType
      }

      type Query {
        getImages: [Image]
        getImage(id: String!): Image
      }

      type Mutation {
        addImage(appId: String! image: ImageInput!): Boolean
        buildImage(imageId: String!): Boolean
        buildImages(imageIds: [String]!): Boolean
        editImage(id: String! image: ImageInput!): Boolean
        changeImageEnvs(imageId: String! envs: [ImageEnvRequirementInput]!): Boolean
        removeImage(id: String!): Boolean
        updateNodesOfImage(imageId: String!): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getImages: resolver<{}, ImageTable[]>(async (parent, args, context, info) => {
        return Image.getImagesData();
      }),
      getImage: resolver<{ id: string }, ImageTable>(async (parent, args, context, info) => {
        return new Image(args.id).getData();
      }),
    },
    Mutation: {
      editImage: resolver<{ id: string, image: ImageTable }, boolean>(async (parent, args, context, info) => {
        await new Image(args.id).edit(args.image);
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
        new Image(args.imageId).build(context.user.id);
        EventsObserver.listener({ type: 'buildImage', data: args });
        return true;
      }),
      buildImages: resolver<{ imageIds: string[] }, boolean>(async (parent, args, context, info) => {
        (async () => {
          for (let i in args.imageIds) {
            const imageId = args.imageIds[i];
            await new Image(imageId).build(context.user.id);
          }
        })();
        EventsObserver.listener({ type: 'buildImages', data: args });
        return true;
      }),
      updateNodesOfImage: resolver<{ imageId: string }, boolean>(async (parent, args, context, info) => {
        const image = new Image(args.imageId);
        image.updateNodes();
        EventsObserver.listener({ type: 'updateNodesOfImage', data: args });
        return true;
      }),
      changeImageEnvs: resolver<{ imageId: string, envs: ImageEnvRequirementTable[] }, boolean>(async (parent, args, context, info) => {
        await new Image(args.imageId).changeEnvs(args.envs);
        EventsObserver.listener({ type: 'changeImageEnvs', data: args });
        return true;
      }),
    },
    Image: {
      repository: resolver<ImageTable, RepositoryTable>(async (parent, args, context, info) => {
        return new Repository(parent.repository_id).getData();
      }),
      envs: resolver<ImageTable, ImageEnvRequirementTable[]>(async (parent, args, context, info) => {
        return new Image(parent.id).getEnvs();
      }),
    },
  },
});

export default imageModule;