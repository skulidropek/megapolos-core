/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import App from '../../../features/repository/App';
import Image from '../../../features/repository/Image';
import Repository from '../../../features/repository/Repository';
import { resolver } from '../../../domain/types';
import EventsObserver from '../../../features/events/eventsObserver';
import {
  ImageEnvRequirementTable,
  ImageTable,
  LogTable,
  RepositoryTable,
} from '../../../features/db/tables';

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
        last_build_log: Log
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
        password
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
        addImage(appId: String!, image: ImageInput!): Boolean
        buildImage(imageId: String!): Boolean
        buildImages(imageIds: [String]!): Boolean
        editImage(id: String!, image: ImageInput!): Boolean
        changeImageEnvs(
          imageId: String!
          envs: [ImageEnvRequirementInput]!
        ): Boolean
        removeImage(id: String!): Boolean
        updateNodesOfImage(imageId: String!): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getImages: resolver<{}, ImageTable[]>(async (parent, args, context) => {
        return new Image(context).getAll();
      }),
      getImage: resolver<{ id: string }, ImageTable>(
        async (parent, args, context) => {
          return new Image(context, args.id).getData();
        }
      ),
    },
    Mutation: {
      editImage: resolver<{ id: string; image: ImageTable }, boolean>(
        async (parent, args, context) => {
          await new Image(context, args.id).edit(args.image);
          EventsObserver.listener({ type: 'editImage', data: args });
          return true;
        }
      ),
      addImage: resolver<{ appId: string; image: ImageTable }, boolean>(
        async (parent, args, context) => {
          await new App(context, args.appId).addImage(args.image);
          EventsObserver.listener({ type: 'addImage', data: args });
          return true;
        }
      ),
      removeImage: resolver<{ id: string }, boolean>(
        async (parent, args, context) => {
          await new Image(context, args.id).delete();
          EventsObserver.listener({ type: 'removeImage', data: args });
          return true;
        }
      ),
      buildImage: resolver<{ imageId: string }, boolean>(
        async (parent, args, context) => {
          await new Image(context, args.imageId).build();
          EventsObserver.listener({ type: 'buildImage', data: args });
          return true;
        }
      ),
      buildImages: resolver<{ imageIds: string[] }, boolean>(
        async (parent, args, context) => {
          (async () => {
            for (let i in args.imageIds) {
              const imageId = args.imageIds[i];
              await new Image(context, imageId).build();
            }
          })();
          EventsObserver.listener({ type: 'buildImages', data: args });
          return true;
        }
      ),
      updateNodesOfImage: resolver<{ imageId: string }, boolean>(
        async (parent, args, context) => {
          const image = new Image(context, args.imageId);
          image.updateNodes();
          EventsObserver.listener({ type: 'updateNodesOfImage', data: args });
          return true;
        }
      ),
      changeImageEnvs: resolver<
        { imageId: string; envs: ImageEnvRequirementTable[] },
        boolean
      >(async (parent, args, context) => {
        await new Image(context, args.imageId).changeEnvs(args.envs);
        EventsObserver.listener({ type: 'changeImageEnvs', data: args });
        return true;
      }),
    },
    Image: {
      repository: resolver<ImageTable, RepositoryTable>(
        async (parent, args, context) => {
          return parent.repository_id
            ? new Repository(context, parent.repository_id).getData()
            : null;
        }
      ),
      envs: resolver<ImageTable, ImageEnvRequirementTable[]>(
        async (parent, args, context) => {
          return new Image(context, parent.id).getEnvs();
        }
      ),
      last_build_log: resolver<ImageTable, LogTable>(
        async (parent, args, context) => {
          return new Image(context, parent.id).getLastBuildLog();
        }
      ),
    },
  },
});

export default imageModule;
