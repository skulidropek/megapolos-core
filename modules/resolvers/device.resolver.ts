import { v4 as uuidv4 } from 'uuid';
import { ContainerDeviceInput, DeviceInput, resolver } from '../../types';
import DeviceModel from '../models/device.model';
import AppInstanceModel from '../models/appInstance.model';
import BaseDevice, { Manifest } from '../devices/baseDevice';
import AppAction from '../actions/app.action';
import AppInstanceAction from '../actions/appInstance.action';
import { sleep } from '../..';
import { createModule, gql } from 'graphql-modules';
import { ContainerDeviceOptionTable, DeviceTable } from '../models/tables';
import EventsObserver from '../events/eventsObserver';

const deviceModule = createModule({
  id: 'device-module',
  dirname: __dirname,
  typeDefs: [
    gql`
    type Manifest {
      name: String
      type: String
      container_fields: [String]
      container_env_fields: [String]
    }
    type Device {
      id: String
      name: String
      device_id: String
      device_name: String
      device_type_id: String
      node_id: String
      driver_id: String
      url: String
      life_status: String
      create_date: String
      update_date: String
      remove_date: String
    }
    type ContainerDeviceOption {
      id: String
      container_id: String
      device_id: String
      device_option_name: String
      container_option_value: String
    }
    input DeviceInput {
      name: String
      inner_port: Int
      image: String
    }
      type Query {
        getDevices: [Device]
        getDeviceManifest(id: String): Manifest
        getContainerDeviceOptions(container_id: String, device_id: String): [ContainerDeviceOption]
      }

      type Mutation {
        addDevice(input: DeviceInput): Boolean
        removeDevice(id: String): Boolean
        addDeviceToContainer(container_id: String, input: ContainerDeviceInput): Boolean
        editDeviceOfContainer(container_id: String, input: ContainerDeviceInput): Boolean
        removeDeviceFromContainer(container_id: String, device_id: String): Boolean        
      }
    `,
  ],
  resolvers: {
    Query: {
      getDevices: resolver<void, DeviceTable[]>(async (parent, args, context, info) => {
        const results = await DeviceModel.getDevices();
        return results;
      }),
      getDeviceManifest: resolver<{ id: string }, Manifest>(async (parent, args, context, info) => {
        const deviceId = args.id;
        
        const container = await DeviceModel.getDeviceContainer(deviceId);
        
        const device = new BaseDevice(container.outer_port);
        return device.getManifest();
      }),
      getContainerDeviceOptions: resolver<{ container_id: string, device_id: string }, (ContainerDeviceOptionTable & { token?: String })[]>(async (parent, args, context, info) => {
        const options = await DeviceModel.getDeviceOptionsOfContainer(args.device_id, args.container_id);
        return options;
      }),
    },
    Mutation: {
      addDevice: resolver<{ input: DeviceInput }, boolean>(async (parent, args, context, info) => {
        const input = args.input;
        const deviceId = uuidv4();
        const driverId = uuidv4();
        const appId = await AppAction.installApp(context.user.id, {
          name: input.name,
          images: [{
            name: input.name,
            repository: input.image,
            inner_port: input.inner_port,
          }],
        });
        const appInstanceId = await AppInstanceAction.createAppInstance({
          app_id: appId,
          name: input.name,
          containers: [],
        }, true);
        await AppInstanceAction.startAppInstance(appInstanceId);
        await DeviceModel.createDriver({
          id: driverId,
          name: input.name,
          app_id: appId,
        });
        await DeviceModel.createDevice({
          id: deviceId,
          name: input.name,
          device_type_id: '',
          node_id: '',
          driver_id: driverId,
        });
        const container = (await AppInstanceModel.getAppInstanceContainers(appInstanceId))[0];
        const device = new BaseDevice(container.outer_port);
        let manifest: Manifest | undefined;
        for (let i = 0; i < 10; i++) {
          try {
            manifest = await device.getManifest();
            break;
          } catch (e) {
            await sleep(1000);
          }
        }
        if (!manifest) {
          throw new Error('Failed to get manifest');
        }
        if (manifest.type) {
          await DeviceModel.updateDeviceType(deviceId, manifest.type);
        }
        EventsObserver.listener({ type: 'addDevice', data: args });
        return true;
      }),
      removeDevice: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        const deviceId = args.id;
        const device = await DeviceModel.getDevice(deviceId);
        const driver = await DeviceModel.getDriver(device.driver_id);
        const appInstance = await AppInstanceModel.getFirstAppInstanceOfApp(driver.app_id);
        await AppInstanceAction.removeAppInstance(appInstance.id, true);
        await AppAction.uninstallApp(driver.app_id);
        await DeviceModel.removeDevice(deviceId);
        await DeviceModel.removeDriver(device.driver_id);
        EventsObserver.listener({ type: 'removeDevice', data: args });
        return true;
      }),
      addDeviceToContainer: resolver<{ container_id: string, input: ContainerDeviceInput }, boolean>(async (parent, args, context, info) => {
        const container = await AppInstanceModel.getContainer(args.container_id);
        const appInstance = await AppInstanceModel.getAppInstance(container.app_instance_id);
        await AppInstanceAction.addDeviceToContainer(
          args.container_id,
          args.input.id,
          appInstance.user_id,
          args.input,
        );
        EventsObserver.listener({ type: 'addDeviceToContainer', data: args });
        return true;
      }),
      editDeviceOfContainer: resolver<{ container_id: string, input: ContainerDeviceInput }, boolean>(async (parent, args, context, info) => {
        AppInstanceAction.updateDeviceToContainer(args.container_id, args.input.id, args.input);
        EventsObserver.listener({ type: 'editDeviceOfContainer', data: args });
        return true;
      }),
      removeDeviceFromContainer: resolver<{ container_id: string, device_id: string }, boolean>(async (parent, args, context, info) => {
        await AppInstanceAction.removeDeviceFromContainer(args.container_id, args.device_id);
        EventsObserver.listener({ type: 'removeDeviceFromContainer', data: args });
        console.log(args);
        return true;
      }),
    },
  },
});

export default deviceModule;