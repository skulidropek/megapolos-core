/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import Container from '../../../features/repository/container/Container';
import ContainerDb from '../../../features/repository/container/ContainerDb';
import Db from '../../../features/repository/db/Db';
import DbUser from '../../../features/repository/db/DbUser';
import Domain from '../../../features/repository/Domain';
import Image from '../../../features/repository/Image';
import MegapolosNode from '../../../features/repository/Node';
import Volume from '../../../features/repository/Volume';
import { ContainerResult, resolver } from '../../../domain/types';
import EventsObserver from '../../../features/events/eventsObserver';
import {
  ContainerDbTable,
  ContainerTable,
  ContainerVariableTable,
  ContainerVolumeTable,
  DbTable,
  DomainTable,
  ImageTable,
  NodeTable,
} from '../../../features/db/tables';

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
        async (parent, args, context) => {
          return new Container(context, args.id).getDataWithDetails();
        },
      ),
      getContainerLog: resolver<{ id: string }, string>(
        async (parent, args, context) => {
          return new Container(context, args.id).getDockerLog();
        },
      ),
      getContainers: resolver<void, ContainerResult[]>(
        async (parent, args, context) => {
          return new Container(context).getAll();
        },
      ),
      listContainerFiles: resolver<{ id: string; path: string }, { files: string[]; directories: string[] }>(
        async (parent, args, context) => {
          return new Container(context, args.id).listFiles(args.path);
        },
      ),
      showContainerFile: resolver<{ id: string; path: string }, string>(
        async (parent, args, context) => {
          return new Container(context, args.id).showFile(args.path);
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
      }, boolean>(async (parent, args, context) => {
        await new Container(context, args.id).changeEnvs(args.envs);
        EventsObserver.listener({ type: 'changeContainerEnvs', data: args });
        return true;
      }),
      changeContainerVariables: resolver<
      { id: string; variables: ContainerVariableTable[] },
      boolean
      >(async (parent, args, context) => {
        await new Container(context, args.id).changeVariables(
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
      >(async (parent, args, context) => {
        await new Container(context).create({
          app_instance_id: args.appInstanceId,
          ...args.data,
        });
        EventsObserver.listener({ type: 'addContainer', data: args });
        return true;
      }),
      editContainer: resolver<{ id: string; data: ContainerTable }, boolean>(
        async (parent, args, context) => {
          await new Container(context, args.id).edit(args.data);
          EventsObserver.listener({ type: 'editContainer', data: args });
          return true;
        },
      ),
      removeContainer: resolver<{ id: string }, boolean>(
        async (parent, args, context) => {
          await new Container(context, args.id).delete();
          EventsObserver.listener({ type: 'removeContainer', data: args });
          return true;
        },
      ),
      startContainer: resolver<{ id: string }, boolean>(
        async (parent, args, context) => {
          await new Container(context, args.id).start();
          EventsObserver.listener({ type: 'startContainer', data: args });
          return true;
        },
      ),
      stopContainer: resolver<{ id: string }, boolean>(
        async (parent, args, context) => {
          await new Container(context, args.id).stop();
          EventsObserver.listener({ type: 'stopContainer', data: args });
          return true;
        },
      ),
      addDbToContainer: resolver<{ input: ContainerDbTable }, ContainerDbTable>(
        async (parent, args, context) => {
          return new ContainerDb(context).create(args.input);
        },
      ),
      removeDbFromContainer: resolver<{ id: string }, boolean>(
        async (parent, args, context) => {
          await new ContainerDb(context, args.id).delete();
          return true;
        },
      ),
    },
    Container: {
      image: resolver<{}, ImageTable>(async (parent, args, context) => {
        return new Image(context, parent.image_id).getData();
      }),
      domain: resolver<{}, DomainTable>(async (parent, args, context) => {
        return parent.domain_id
          ? new Domain(context, parent.domain_id).getData()
          : null;
      }),
      node: resolver<{}, NodeTable>(async (parent, args, context) => {
        return new MegapolosNode(context, parent.node_id).getData();
      }),
      volumes: resolver<{}, ContainerVolumeTable[]>(
        async (parent, args, context) => {
          return new Volume(context).getVolumesOfContainer(
            parent.id,
          );
        },
      ),
      envs: resolver<{}, { key: string; value: string }[]>(
        async (parent, args, context) => {
          if (parent.envs) {
            return parent.envs;
          }
          return (await new Container(context, parent.id).getEnvs()).map((env) => (
            {
              key: env.container_env_name,
              value: env.container_env_value,
            }
          ));
        },
      ),
      variables: resolver<{}, ContainerVariableTable[]>(
        async (parent, args, context) => {
          return new Container(context, parent.id).getVariables();
        },
      ),
      runtimeVariables: resolver<{}, string>(
        async (parent, args, context) => {
          return JSON.stringify(
            await new Container(context, parent.id)
              .getRuntimeVariables(),
            null,
            2,
          );
        },
      ),
      dbs: resolver<{}, ContainerDbTable[]>(
        async (parent, args, context) => {
          return new Container(context, parent.id).getDbs();
        },
      ),
    },
    ContainerDb: {
      db: resolver<{}, DbTable>(async (parent, args, context) => {
        return new Db(context, parent.db_id).getData();
      }),
      dbUser: resolver<{}, DbTable>(async (parent, args, context) => {
        return new DbUser(context, parent.db_user_id).getData();
      }),
    },
  },
});

export default containerModule;
