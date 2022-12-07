import { Express } from 'express';
import docker from '../../coreDocker';
import { AppInput, AppInstanceInput, resolver, TypedRequestBody } from '../../types';
import AppModel from '../models/app.model';
import AppInstanceModel from '../models/appInstance.model';
import { AppInstanceTable, AppTable, ContainerTable, ImageTable } from '../models/tables';
import AppAction from '../actions/app.action';
import AppInstanceAction from '../actions/appInstance.action';
import BaseController from './base.controller';
import DeviceModel from '../models/device.model';
import { createModule, gql } from 'graphql-modules';

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
        repository: String
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
      }

      input AppInput {
        name: String!
        images: [ImageInput!]
      }

      input ImageInput {
        name: String
        repository: String
        inner_port: Int
      }

      input ContainerDeviceParameterInput {
        key: String
        value: String
      }

      input ContainerDeviceInput {
        id: String
        parameters: [ContainerDeviceParameterInput]
        env_parameters: [ContainerDeviceParameterInput]
      }

      input ContainerVolumeInput {
        type: String
        path: String
      }

      input ContainerInput {
        image_id: String
        devices: [ContainerDeviceInput]
        volumes: [ContainerVolumeInput]
      }
      
      input AppInstanceInput {
        app_id: String,
        name: String,
        containers: [ContainerInput]
      }

      type Query {
        getApps: [App]
        getAppInstances: [AppInstance]
      }

      type Mutation {
        installApp(input: AppInput!): Boolean
        uninstallApp(id: String!): Boolean
        createAppInstance(input: AppInstanceInput!): Boolean
        startAppInstance(id: String!): Boolean
        stopAppInstance(id: String!): Boolean
        removeAppInstance(id: String!): Boolean
        updateContainer(id: String!): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getApps: resolver<void, (AppTable & { images?: ImageTable[] })[]>(async (parent, args, context, info) => {
        const results:(AppTable & { images?: ImageTable[] })[] = await AppModel.getApps();
        for (let i in results) {
          const images = await AppModel.getImagesOfApp(results[i].id);
          results[i].images = images;
        }
        return results;
      }),
      getAppInstances: resolver<void, (AppInstanceTable & { containers?: ContainerTable[] })[]>(async (parent, args, context, info) => {
        const results:(AppInstanceTable & { containers?: ContainerTable[] })[] = await AppInstanceModel.getAppInstances();
        for (let i in results) {
          const containers: (ContainerTable & { devices?: any })[] = await AppInstanceModel.getAppInstanceContainers(results[i].id);
          results[i].containers = containers;
          for (let j in containers) {
            const devices = await DeviceModel.getDevicesOfContainer(containers[j].id);
            containers[j].devices = devices;
            for (let k in devices) {
              const options = await DeviceModel.getDeviceOptionsOfContainer(devices[k].device_id, containers[j].id);
              const envs = await DeviceModel.getDeviceEnvsOfContainer(devices[k].device_id, containers[j].id);
              (devices[k] as any).options = options;
              (devices[k] as any).envs = envs;
            }
          }
        }
        return results;
      }),
    },
    Mutation: {
      installApp: resolver<{ input: AppInput }, boolean>(async (parent, args, context, info) => {
        await AppAction.installApp(context.user.id, args.input);
        return true;
      }),
      uninstallApp: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        await AppAction.uninstallApp(args.id);
        return true;
      }),
      createAppInstance: resolver<{ input: AppInstanceInput }, boolean>(async (parent, args, context, info) => {
        await AppInstanceAction.createAppInstance(args.input);
        return true;
      }),
      startAppInstance: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        await AppInstanceAction.startAppInstance(args.id);
        return true;
      }),
      stopAppInstance: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        await AppInstanceAction.stopAppInstance(args.id);
        return true;
      }),
      removeAppInstance: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        await AppInstanceAction.removeAppInstance(args.id);
        return true;
      }),
      updateContainer: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        const containerId = args.id;
        const container = await AppInstanceModel.getContainer(containerId);
        const appInstance = await AppInstanceModel.getAppInstance(container.app_instance_id);
        const image = await AppModel.getImage(container.image_id);
        const dockerRuntimeId = container.docker_runtime_id;
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
        const dockerContainer = await AppInstanceAction.createContainer({
          appId: appInstance.app_id,
          appInstanceId: appInstance.id,
          containerId: container.id,
          imageId: container.image_id,
          imageName: image.name,
          imageRepository: image.repository,
          innerPort: image.inner_port,
          outerPort: container.outer_port,
          userId: appInstance.user_id,
        });
        await dockerContainer.start();
  
        await AppInstanceModel.updateContainerDockerRuntimeId(containerId, dockerContainer.id);
        return true;
      }),
    },
  },
});

export default appModule;