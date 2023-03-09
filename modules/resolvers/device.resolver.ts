import { v4 as uuidv4 } from 'uuid';
import { ContainerDeviceInput, DeviceInput, resolver } from '../../types';
import DeviceModel from '../models/device.model';
import AppInstanceModel from '../models/appInstance.model';
import BaseDevice, { Manifest } from '../devices/baseDevice';
import AppAction from '../actions/app.action';
import AppInstanceAction from '../actions/appInstance.action';
import { sleep } from '../..';
import { createModule, gql } from 'graphql-modules';
import { ContainerDeviceOptionTable, DeviceOptionTable, DeviceTable } from '../models/tables';
import EventsObserver from '../events/eventsObserver';
import AppModel from '../models/app.model';
import DeviceAction from '../actions/device.action';

const deviceModule = createModule({
  id: 'device-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type Manifest {
        name: String
        type: String
        fields: [String]
        container_fields: [String]
        container_env_fields: [String]
      }
      type DeviceOption {
        id: String
        device_id: String
        device_option_name: String
        device_option_value: String
      }
      input DeviceOptionInput {
        key: String
        value: String
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
        backup_volume_id: String
        create_date: String
        update_date: String
        remove_date: String
        options: [DeviceOption]
      }
      type DeviceBackup {
        id: String
        name: String
        device_id: String
        container_id: String
        image_id: String
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
        getDevice(id: String): Device
        getDevices: [Device]
        getDeviceManifest(id: String): Manifest
        getDeviceOptions(device_id: String): [DeviceOption]
        getContainerDeviceOptions(container_id: String, device_id: String): [ContainerDeviceOption]
        getDeviceBackup: [DeviceBackup]
        getContainerDomain(container_id: String): String
      }

      type Mutation {
        addDevice(input: DeviceInput): Boolean
        removeDevice(id: String): Boolean
        setDeviceOptions(id: String, options: [DeviceOptionInput]): Boolean
        addDeviceToContainer(container_id: String, input: ContainerDeviceInput): Boolean
        editDeviceOfContainer(container_id: String, input: ContainerDeviceInput): Boolean
        removeDeviceFromContainer(container_id: String, device_id: String): Boolean        
        createDeviceFromApp(app_id: String): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getDevice: resolver<{ id: string }, (DeviceTable & { options: DeviceOptionTable[] })>(async (parent, args, context, info) => {
        const device = await DeviceModel.getDevice(args.id) as DeviceTable & { options: DeviceOptionTable[] };
        const options = await DeviceModel.getDeviceOptions(device.id);
        device.options = options;
        return device;
      }),
      getDevices: resolver<void, (DeviceTable & { options: DeviceOptionTable[] })[]>(async (parent, args, context, info) => {
        const results = await DeviceModel.getDevices() as (DeviceTable & { options: DeviceOptionTable[] })[];
        for (const k in results) {
          const device = results[k];
          const options = await DeviceModel.getDeviceOptions(device.id);
          device.options = options;
        }
        return results;
      }),
      getDeviceManifest: resolver<{ id: string }, Manifest>(async (parent, args, context, info) => {
        const deviceId = args.id;
        
        const container = await DeviceModel.getDeviceContainer(deviceId);
        
        const device = new BaseDevice(container.outer_port);
        return device.getManifest();
      }),
      getDeviceOptions: resolver<{ device_id: string }, DeviceOptionTable[]>(async (parent, args, context, info) => {
        const deviceId = args.device_id;
        const options = await DeviceModel.getDeviceOptions(deviceId);
        return options;
      }),
      getContainerDeviceOptions: resolver<{ container_id: string, device_id: string }, (ContainerDeviceOptionTable & { token?: String })[]>(async (parent, args, context, info) => {
        const options = await DeviceModel.getDeviceOptionsOfContainer(args.device_id, args.container_id);
        return options;
      }),
      getContainerDomain: resolver<{ container_id: string }, string>(async (parent, args, context, info) => {
        const devices = await DeviceModel.getDevicesOfContainer(args.container_id);
        const domainDevice = devices.find((device) => device.device_type_id === 'domain');
        if (domainDevice) {
          const options = await DeviceModel.getDeviceOptionsOfContainer(domainDevice.device_id, args.container_id);
          const domainOption = options.find((option) => option.device_option_name === 'domain');
          if (domainOption) {
            return domainOption.container_option_value;
          }
        }
        return '';
      }),
    },
    Mutation: {
      addDevice: resolver<{ input: DeviceInput }, boolean>(async (parent, args, context, info) => {
        const input = args.input;
        const appId = await AppAction.installApp(context.user.id, {
          name: input.name,
          images: [{
            name: input.name,
            repository: input.image,
            inner_port: input.inner_port,
          }],
        });
        const images = await AppModel.getImagesOfApp(appId);
        const appInstanceId = await AppInstanceAction.createAppInstance({
          app_id: appId,
          name: input.name,
          containers: [{
            devices: [],
            envs: [],
            volumes: [],
            fixed_outer_port: 0,
            image_id: images[0].id,
          }],
        }, true);
        await AppInstanceAction.startAppInstance(appInstanceId);

        await DeviceAction.createDevice(appId);
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
      setDeviceOptions: resolver<{ id: string, options: { key: string, value: string }[] }, boolean>(async (parent, args, context, info) => {
        await DeviceModel.setDeviceOptions(args.id, args.options);
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
      createDeviceFromApp: resolver<{ app_id: string }, boolean>(async (parent, args, context, info) => {
        await DeviceAction.createDevice(args.app_id);
        EventsObserver.listener({ type: 'createDeviceFromApp', data: args });
        return true;
      }),
    },
  },
});

export default deviceModule;