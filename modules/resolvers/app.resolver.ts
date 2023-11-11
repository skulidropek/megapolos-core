/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { AppInput, AppInstanceInput, AppInstanceResult, ContainerResult, resolver } from '../../types';
import { AppTable, DeviceTable, ImageTable } from '../models/tables';
import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../events/eventsObserver';
import App from '../../classes/App';
import Instance from '../../classes/Instance';
import Container from '../../classes/Container';
import Image from '../../classes/Image';

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
        create_date: String
        update_date: String
        images: [Image]
      }
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
      }
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
        create_date: String
        update_date: String
        remove_date: String
        containers: [Container]
      }
      type Container {
        id: String
        docker_runtime_id: String
        name: String
        image_id: String
        node_id: String
        outer_port: Int
        app_instance_id: String
        life_status: String
        create_date: String
        update_date: String
        remove_date: String
        devices: [ContainerDevice]
        volumes: [ContainerVolume]
        envs: [ContainerParameter]
        docker_status: String
      }

      input AppInput {
        name: String!
        images: [ImageInput!]
      }

      input ImageInput {
        name: String
        image: String
        inner_port: Int
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
        image_id: String
        fixed_outer_port: Int
        devices: [ContainerDeviceInput]
        volumes: [ContainerVolumeInput]
        envs: [ContainerParameterInput]
      }
      
      input AppInstanceInput {
        app_id: String,
        name: String,
        containers: [ContainerInput]
      }

      type Query {
        getApps: [App]
        getApp(id: String): App
        getAppInstances: [AppInstance]
        getAppInstance(id: String): AppInstance
        getContainer(id: String): Container
        getContainerDevices(id: String): [Device]
        getContainerLog(id: String): String
      }

      type Mutation {
        installApp(input: AppInput!): Boolean
        uninstallApp(id: String!): Boolean
        createAppInstance(input: AppInstanceInput!): Boolean
        startAppInstance(id: String!): Boolean
        stopAppInstance(id: String!): Boolean
        restartAppInstance(id: String!): Boolean
        removeAppInstance(id: String!): Boolean
        updateContainer(id: String! noRebuild: Boolean): Boolean
        changeContainerEnvs(id: String!, envs: [ContainerParameterInput]): Boolean
        editApp(id: String! name: String!): Boolean
        editImage(id: String! name: String! image: String! inner_port: Int!): Boolean
        editAppInstance(id: String! name: String!): Boolean
        editContainer(id: String! name: String! outer_port: Int): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getApps: resolver<void, (AppTable & { images?: ImageTable[] })[]>(async (parent, args, context, info) => {
        const apps = await App.getApps();
        const results:(AppTable & { images?: ImageTable[] })[] = [];
        for (let i in apps) {
          const app = apps[i];
          const result:(AppTable & { images?: ImageTable[] }) = await app.getDataWithImages();
          results.push(result);
        }
        return results;
      }),
      getApp: resolver<{ id: string }, (AppTable & { images?: ImageTable[] })>(async (parent, args, context, info) => {
        const app = new App(args.id);
        return app.getDataWithImages();
      }),
      getAppInstances: resolver<void, AppInstanceResult[]>(async (parent, args, context, info) => {
        const results:AppInstanceResult[] = await Promise.all((await Instance.getInstances()).map((instance) => instance.getDataWithContainers()));
        return results;
      }),
      getAppInstance: resolver<{ id: string }, AppInstanceResult>(async (parent, args, context, info) => {
        return new Instance(args.id).getDataWithContainers();
      }),
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
      installApp: resolver<{ input: AppInput }, boolean>(async (parent, args, context, info) => {
        await App.installApp(context.user.id, args.input);
        EventsObserver.listener({ type: 'installApp', data: args });
        return true;
      }),
      uninstallApp: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        await new App(args.id).uninstall();
        EventsObserver.listener({ type: 'uninstallApp', data: args });
        return true;
      }),
      createAppInstance: resolver<{ input: AppInstanceInput }, boolean>(async (parent, args, context, info) => {
        await Instance.createInstance(args.input);
        EventsObserver.listener({ type: 'createAppInstance', data: args });
        return true;
      }),
      startAppInstance: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        await new Instance(args.id).start();
        EventsObserver.listener({ type: 'startAppInstance', data: args });
        return true;
      }),
      stopAppInstance: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        await new Instance(args.id).stop();
        EventsObserver.listener({ type: 'stopAppInstance', data: args });
        return true;
      }),
      restartAppInstance: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        await new Instance(args.id).stop();
        await new Instance(args.id).start();
        EventsObserver.listener({ type: 'startAppInstance', data: args });
        return true;
      }),
      removeAppInstance: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        await new Instance(args.id).remove();
        EventsObserver.listener({ type: 'removeAppInstance', data: args });
        return true;
      }),
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
      editApp: resolver<{ id: string, name: string }, boolean>(async (parent, args, context, info) => {
        await new App(args.id).edit(args.name);
        EventsObserver.listener({ type: 'editApp', data: args });
        return true;
      }),
      editImage: resolver<{ id: string, name: string, image: string, inner_port: number }, boolean>(async (parent, args, context, info) => {
        await new Image(args.id).edit(args.name, args.image, args.inner_port);
        EventsObserver.listener({ type: 'editImage', data: args });
        return true;
      }),
      editAppInstance: resolver<{ id: string, name: string }, boolean>(async (parent, args, context, info) => {
        await new Instance(args.id).edit(args.name);
        EventsObserver.listener({ type: 'editAppInstance', data: args });
        return true;
      }),
      editContainer: resolver<{ id: string, name: string, outer_port: number }, boolean>(async (parent, args, context, info) => {
        await new Container(args.id).edit(args.name, args.outer_port);
        EventsObserver.listener({ type: 'editContainer', data: args });
        return true;
      }),
    },
  },
});

export default appModule;