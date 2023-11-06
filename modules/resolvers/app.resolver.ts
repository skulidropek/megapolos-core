/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import docker from '../../coreDocker';
import { AppInput, AppInstanceInput, resolver } from '../../types';
import AppModel from '../models/app.model';
import AppInstanceModel from '../models/appInstance.model';
import { AppInstanceTable, AppTable, ContainerTable, DeviceTable, ImageTable } from '../models/tables';
import AppInstanceAction from '../actions/appInstance.action';
import DeviceModel from '../models/device.model';
import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../events/eventsObserver';
import VolumeModel from '../models/volume.model';
import App from '../../classes/App';
import Instance from '../../classes/Instance';
import Container from '../../classes/Container';

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
        getContainerDevices(id: String): [Device]
      }

      type Mutation {
        installApp(input: AppInput!): Boolean
        uninstallApp(id: String!): Boolean
        createAppInstance(input: AppInstanceInput!): Boolean
        startAppInstance(id: String!): Boolean
        stopAppInstance(id: String!): Boolean
        removeAppInstance(id: String!): Boolean
        updateContainer(id: String! noRebuild: Boolean): Boolean
        changeContainerEnvs(id: String!, envs: [ContainerParameterInput]): Boolean
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
      getAppInstances: resolver<void, (AppInstanceTable & { containers?: ContainerTable[] })[]>(async (parent, args, context, info) => {
        const results:(AppInstanceTable & { containers?: ContainerTable[] })[] = await AppInstanceModel.getAppInstances();
        for (let i in results) {
          const containers: (ContainerTable & { devices?: any, volumes?: any, envs?: any, docker_status?: string })[] = await AppInstanceModel.getAppInstanceContainers(results[i].id);
          results[i].containers = containers;
          for (let j in containers) {
            const devices = await DeviceModel.getDevicesOfContainer(containers[j].id);
            containers[j].devices = [];
            for (let k in devices) {
              const auxOptions = await DeviceModel.getDeviceAuxOptionsOfContainer(devices[k].id, containers[j].id);
              const envs = await DeviceModel.getDeviceEnvsOfContainer(devices[k].id, containers[j].id);
              containers[j].devices.push({
                device: devices[k],
                parameters: auxOptions.map((option) => ({ key: option.device_option_name, value: option.container_option_value })),
                env_parameters: envs.map((env) => ({ key: env.device_option_name, value: env.container_env_name })),
              });
            }
            const volumes = await VolumeModel.getVolumesOfContainer(containers[j].id);
            containers[j].volumes = volumes;
            const envs = await AppInstanceModel.getContainerEnvOptions(containers[j].id);
            containers[j].envs = envs.map((env) => ({ key: env.container_env_name, value: env.container_env_value }));
            if (containers[j].docker_runtime_id) {
              try {
                const dockerStatus = (await docker.getContainer(containers[j].docker_runtime_id).inspect()).State.Status;
                containers[j].docker_status = dockerStatus;
              } catch (e) {
                containers[j].docker_status = 'not exist';
              }
            }
          }
        }
        return results;
      }),
      getAppInstance: resolver<{ id: string }, (AppInstanceTable & { containers?: ContainerTable[] })>(async (parent, args, context, info) => {
        const appInstance:(AppInstanceTable & { containers?: ContainerTable[] }) = await AppInstanceModel.getAppInstance(args.id);
        const containers: (ContainerTable & { devices?: any, volumes?: any, envs?: any, docker_status?: string })[] = await AppInstanceModel.getAppInstanceContainers(args.id);
        appInstance.containers = containers;
        for (let j in containers) {
          const devices = await DeviceModel.getDevicesOfContainer(containers[j].id);
          containers[j].devices = [];
          for (let k in devices) {
            const auxOptions = await DeviceModel.getDeviceAuxOptionsOfContainer(devices[k].id, containers[j].id);
            const envs = await DeviceModel.getDeviceEnvsOfContainer(devices[k].id, containers[j].id);
            containers[j].devices.push({
              device: devices[k],
              parameters: auxOptions.map((option) => ({ key: option.device_option_name, value: option.container_option_value })),
              env_parameters: envs.map((env) => ({ key: env.device_option_name, value: env.container_env_name })),
            });
          }
          const volumes = await VolumeModel.getVolumesOfContainer(containers[j].id);
          containers[j].volumes = volumes;
          const envs = await AppInstanceModel.getContainerEnvOptions(containers[j].id);
          containers[j].envs = envs.map((env) => ({ key: env.container_env_name, value: env.container_env_value }));
          if (containers[j].docker_runtime_id) {
            try {
              const dockerStatus = (await docker.getContainer(containers[j].docker_runtime_id).inspect()).State.Status;
              containers[j].docker_status = dockerStatus;
            } catch (e) {
              containers[j].docker_status = 'not exist';
            }
          }
        }
        return appInstance;
      }),
      getContainerDevices: resolver<{ id: string }, DeviceTable[]>(async (parent, args, context, info) => {
        return Promise.all((await new Container(args.id).getDevices()).map((device) => device.getData()));
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
        await AppInstanceAction.createAppInstance(args.input);
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
      removeAppInstance: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        await AppInstanceAction.removeAppInstance(args.id);
        EventsObserver.listener({ type: 'removeAppInstance', data: args });
        return true;
      }),
      updateContainer: resolver<{ id: string, noRebuild: boolean }, boolean>(async (parent, args, context, info) => {
        const containerId = args.id;
        const container = await AppInstanceModel.getContainer(containerId);
        const appInstance = await AppInstanceModel.getAppInstance(container.app_instance_id);
        const image = await AppModel.getImage(container.image_id);
        const dockerRuntimeId = container.docker_runtime_id;
        if (dockerRuntimeId) {
          try {
            await docker.getContainer(dockerRuntimeId).stop();
          } catch (e) {
            console.error(e);
          }
          try {
            await docker.getContainer(dockerRuntimeId).remove();
          } catch (e) {
            console.error(e);
          }
        }
        await AppInstanceAction.createContainer({
          appId: appInstance.app_id,
          appInstanceId: appInstance.id,
          containerId: container.id,
          imageId: container.image_id,
          imageName: image.image,
          imageRepository: image.image,
          innerPort: image.inner_port,
          outerPort: container.outer_port,
          userId: appInstance.user_id,
          noRebuild: args.noRebuild,
        });
        // await dockerContainer.start();
  
        // await AppInstanceModel.updateContainerDockerRuntimeId(containerId, dockerContainer.id);
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
    },
  },
});

export default appModule;