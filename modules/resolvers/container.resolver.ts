/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { AppInput, AppInstanceInput, AppInstanceResult, ContainerResult, resolver } from '../../types';
import { AppTable, ContainerTable, DeviceTable, DomainTable, ImageTable, RepositoryTable } from '../models/tables';
import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../events/eventsObserver';
import App from '../../classes/App';
import Instance from '../../classes/Instance';
import Container from '../../classes/Container';
import Image from '../../classes/Image';
import Repository from '../../classes/Repository';
import Domain from '../../classes/Domain';

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
        devices: [ContainerDevice]
        volumes: [ContainerVolume]
        envs: [ContainerParameter]
        docker_status: String
        domain_id: String
        domain: Domain
        image: Image
      }

      input ContainerDeviceParameterInput {
        key: String
        value: String
      }

      input ContainerParameterInput {
        key: String
        value: String
      }

      type ContainerParameter {
        key: String
        value: String
      }

      input ContainerDeviceInput {
        id: String
        aux_parameters: [ContainerDeviceParameterInput]
        env_parameters: [ContainerDeviceParameterInput]
      }

      type ContainerDeviceParameter {
        key: String
        value: String
      }

      type ContainerDevice {
        device: Device
        aux_parameters: [ContainerDeviceParameter]
        env_parameters: [ContainerDeviceParameter]
      }

      type ContainerVolume {
        id: String
        name: String
        container_id: String
        volume_id: String
        inner_path: String
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
        getContainerDevices(id: String): [Device]
        getContainerLog(id: String): String
      }

      type Mutation {
        addContainer(appInstanceId: String! data: ContainerInput!): Boolean
        updateContainer(id: String! noRebuild: Boolean): Boolean
        changeContainerEnvs(id: String!, envs: [ContainerParameterInput]): Boolean
        editContainer(id: String! data: ContainerInput!): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getContainer: resolver<{ id: string }, ContainerResult>(async (parent, args, context, info) => {
        return new Container(args.id).getDataWithDetails();
      }),
      getContainerDevices: resolver<{ id: string }, DeviceTable[]>(async (parent, args, context, info) => {
        return Promise.all((await new Container(args.id).getDevices()).map((device) => device.getData()));
      }),
      getContainerLog: resolver<{ id: string }, string>(async (parent, args, context, info) => {
        return new Container(args.id).getDockerLog();
      }),
    },
    Mutation: {
      updateContainer: resolver<{ id: string, noRebuild: boolean }, boolean>(async (parent, args, context, info) => {
        await new Container(args.id).update(args.noRebuild);
        EventsObserver.listener({ type: 'updateContainer', data: args });
        return true;
      }),
      changeContainerEnvs: resolver<{ id: string, envs: {
        key: string,
        value: string,
      }[] }, boolean>(async (parent, args, context, info) => {
        console.log(args);
        await new Container(args.id).changeEnvs(args.envs);
        EventsObserver.listener({ type: 'changeContainerEnvs', data: args });
        return true;
      }),
      addContainer: resolver<{ appInstanceId: string, data: ContainerTable }, boolean>(async (parent, args, context, info) => {
        await Container.create(args.appInstanceId, args.data);
        EventsObserver.listener({ type: 'addContainer', data: args });
        return true;
      }),
      editContainer: resolver<{ id: string, data: ContainerTable }, boolean>(async (parent, args, context, info) => {
        await new Container(args.id).edit(args.data);
        EventsObserver.listener({ type: 'editContainer', data: args });
        return true;
      }),
    },
    Container: {
      image: resolver<{}, ImageTable>(async (parent, args, context, info) => {
        return new Image(parent.image_id).getData();
      }),
      domain: resolver<{}, DomainTable>(async (parent, args, context, info) => {
        return new Domain(parent.domain_id).getData();
      }),
    },
  },
});

export default containerModule;