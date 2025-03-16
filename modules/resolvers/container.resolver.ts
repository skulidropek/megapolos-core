/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import Container from '../../classes/Container';
import ContainerDb from '../../classes/ContainerDb';
import Db from '../../classes/Db';
import DbUser from '../../classes/DbUser';
import Domain from '../../classes/Domain';
import Image from '../../classes/Image';
import MegapolosNode from '../../classes/Node';
import Volume from '../../classes/Volume';
import { ContainerResult, resolver } from '../../types';
import EventsObserver from '../events/eventsObserver';
import {
  ContainerDbTable,
  ContainerTable,
  ContainerVariableTable,
  ContainerVolumeTable,
  DbTable,
  DomainTable,
  ImageTable,
  NodeTable,
} from '../models/tables';

const containerModule = createModule({
  id: 'container-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type Container {
        id: String
        docker_runtime_id: String
        name: String
        image_id: String
        node_id: String
        outer_port: Int
        app_instance_id: String
        life_status: String
        create_date: DateTime
        update_date: DateTime
        remove_date: DateTime
        volumes: [ContainerVolume]
        envs: [ContainerParameter]
        variables: [ContainerVariable]
        docker_status: String
        domain_id: String
        domain: Domain
        image: Image
        node: Node
        dbs: [ContainerDb]
        runtimeVariables: String
      }

      input ContainerParameterInput {
        key: String
        value: String
      }

      type ContainerParameter {
        key: String
        value: String
      }

      enum ContainerVariableType {
        string
        password
      }

      input ContainerVariableInput {
        name: String
        type: ContainerVariableType
        value: String
      }

      type ContainerVariable {
        name: String
        type: ContainerVariableType
        value: String
      }

      type ContainerVolume {
        id: String
        name: String
        container_id: String
        volume_id: String
        inner_path: String
      }

      type ContainerDb {
        id: ID
        db: Db
        dbUser: DbUser
        name: String
      }

      input ContainerDbInput {
        container_id: String
        db_id: String
        db_user_id: String
        name: String
      }


      input ContainerVolumeInput {
        name: String
        volume: String
        inner_path: String
        is_dynamic: Boolean
      }

      input ContainerInput {
        app_instance_id: String
        name: String
        image_id: String
        outer_port: Int
        node_id: String
        domain_id: String
      }
      
      type Query {
        getContainer(id: String): Container
        getContainerLog(id: String): String
        getContainers: [Container]
        listContainerFiles(id: String! path: String!): ContainerFiles
        showContainerFile(id: String! path: String!): String
      }

      type Mutation {
        addContainer(appInstanceId: String! data: ContainerInput!): Boolean
        updateContainer(id: String! noRebuild: Boolean): Boolean
        changeContainerEnvs(id: String!, envs: [ContainerParameterInput]): Boolean
        changeContainerVariables(id: String!, variables: [ContainerVariableInput]): Boolean
        editContainer(id: String! data: ContainerInput!): Boolean
        removeContainer(id: String!): Boolean
        startContainer(id: String!): Boolean
        stopContainer(id: String!): Boolean
        addDbToContainer(input: ContainerDbInput!): ContainerDb
        removeDbFromContainer(id: String!): Boolean
      }

      type ContainerFiles {
        files: [String]
        directories: [String]
      }
    `,
  ],
  resolvers: {
    Query: {
      getContainer: resolver<{ id: string }, ContainerResult>(
        async (parent, args, context, info) => {
          return new Container(args.id, context.user.id).getDataWithDetails();
        },
      ),
      getContainerLog: resolver<{ id: string }, string>(
        async (parent, args, context, info) => {
          return new Container(args.id, context.user.id).getDockerLog();
        },
      ),
      getContainers: resolver<void, ContainerResult[]>(
        async (parent, args, context, info) => {
          return new Container(undefined, context.user.id).getAll();
        },
      ),
      listContainerFiles: resolver<
        { id: string; path: string },
        { files: string[]; directories: string[] }
      >(async (parent, args, context, info) => {
        return new Container(args.id, context.user.id).listFiles(args.path);
      }),
      showContainerFile: resolver<{ id: string; path: string }, string>(
        async (parent, args, context, info) => {
          return new Container(args.id, context.user.id).showFile(args.path);
        },
      ),
    },
    Mutation: {
      changeContainerEnvs: resolver<{
        id: string;
        envs: {
          key: string;
          value: string;
        }[];
      }, boolean>(async (parent, args, context, info) => {
        await new Container(args.id, context.user.id).changeEnvs(args.envs);
        EventsObserver.listener({ type: 'changeContainerEnvs', data: args });
        return true;
      }),
      changeContainerVariables: resolver<
        { id: string; variables: ContainerVariableTable[] },
        boolean
      >(async (parent, args, context, info) => {
        await new Container(args.id, context.user.id).changeVariables(
          args.variables,
        );
        EventsObserver.listener({
          type: 'changeContainerVariables',
          data: args,
        });
        return true;
      }),
      addContainer: resolver<
        { appInstanceId: string; data: ContainerTable },
        boolean
      >(async (parent, args, context, info) => {
        await new Container(undefined, context.user.id).create({
          app_instance_id: args.appInstanceId,
          ...args.data,
        });
        EventsObserver.listener({ type: 'addContainer', data: args });
        return true;
      }),
      editContainer: resolver<{ id: string; data: ContainerTable }, boolean>(
        async (parent, args, context, info) => {
          await new Container(args.id, context.user.id).edit(args.data);
          EventsObserver.listener({ type: 'editContainer', data: args });
          return true;
        },
      ),
      removeContainer: resolver<{ id: string }, boolean>(
        async (parent, args, context, info) => {
          await new Container(args.id, context.user.id).delete();
          EventsObserver.listener({ type: 'removeContainer', data: args });
          return true;
        },
      ),
      startContainer: resolver<{ id: string }, boolean>(
        async (parent, args, context, info) => {
          await new Container(args.id, context.user.id).start();
          EventsObserver.listener({ type: 'startContainer', data: args });
          return true;
        },
      ),
      stopContainer: resolver<{ id: string }, boolean>(
        async (parent, args, context, info) => {
          await new Container(args.id, context.user.id).stop();
          EventsObserver.listener({ type: 'stopContainer', data: args });
          return true;
        },
      ),
      addDbToContainer: resolver<{ input: ContainerDbTable }, ContainerDbTable>(
        async (parent, args, context, info) => {
          return new ContainerDb(undefined, context.user.id).create(args.input);
        },
      ),
      removeDbFromContainer: resolver<{ id: string }, boolean>(
        async (parent, args, context, info) => {
          await new ContainerDb(args.id, context.user.id).delete();
          return true;
        },
      ),
    },
    Container: {
      image: resolver<{}, ImageTable>(async (parent, args, context, info) => {
        return new Image(parent.image_id, context.user.id).getData();
      }),
      domain: resolver<{}, DomainTable>(async (parent, args, context, info) => {
        return parent.domain_id
          ? new Domain(parent.domain_id, context.user.id).getData()
          : null;
      }),
      node: resolver<{}, NodeTable>(async (parent, args, context, info) => {
        return new MegapolosNode(parent.node_id, context.user.id).getData();
      }),
      volumes: resolver<{}, ContainerVolumeTable[]>(
        async (parent, args, context, info) => {
          return new Volume(undefined, context.user.id).getVolumesOfContainer(
            parent.id,
          );
        },
      ),
      envs: resolver<{}, { key: string; value: string }[]>(
        async (parent, args, context, info) => {
          if (parent.envs) {
            return parent.envs;
          }
          return (await new Container(parent.id).getEnvs()).map((env) => (
            {
              key: env.container_env_name,
              value: env.container_env_value,
            }
          ));
        },
      ),
      variables: resolver<{}, ContainerVariableTable[]>(
        async (parent, args, context, info) => {
          return new Container(parent.id, context.user.id).getVariables();
        },
      ),
      runtimeVariables: resolver<{}, string>(
        async (parent, args, context, info) => {
          return JSON.stringify(
            await new Container(parent.id, context.user.id)
              .getRuntimeVariables(),
            null,
            2,
          );
        },
      ),
      dbs: resolver<{}, ContainerDbTable[]>(
        async (parent, args, context, info) => {
          return new Container(parent.id, context.user.id).getDbs();
        },
      ),
    },
    ContainerDb: {
      db: resolver<{}, DbTable>(async (parent, args, context, info) => {
        return new Db(parent.db_id, context.user.id).getData();
      }),
      dbUser: resolver<{}, DbTable>(async (parent, args, context, info) => {
        return new DbUser(parent.db_user_id, context.user.id).getData();
      }),
    },
  },
});

export default containerModule;
