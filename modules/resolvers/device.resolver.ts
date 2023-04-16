import { v4 as uuidv4 } from 'uuid';
import { ContainerDeviceInput, DeviceInput, resolver } from '../../types';
import DeviceModel from '../models/device.model';
import AppInstanceModel from '../models/appInstance.model';
import BaseDevice, { Manifest } from '../devices/baseDevice';
import AppAction from '../actions/app.action';
import AppInstanceAction from '../actions/appInstance.action';
import { sleep } from '../..';
import { createModule, gql } from 'graphql-modules';
import { ContainerDeviceCertificateTable, ContainerDeviceDbTable, ContainerDeviceDomainTable, ContainerDeviceAuxOptionTable, DeviceOptionTable, DeviceTable, ContainerDeviceEnvOptionTable, ContainerTable, ContainerDeviceRepositoryTable } from '../models/tables';
import EventsObserver from '../events/eventsObserver';
import AppModel from '../models/app.model';
import DeviceAction from '../actions/device.action';
import DomainDevice from '../devices/domainDevice';

const deviceModule = createModule({
  id: 'device-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type Manifest {
        name: String
        type: String
        fields: [String]
        container_aux_fields: [String]
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
        device_type_id: String
        node_id: String
        is_virtual: Int
        virtual_device_container_id: String
        driver_id: String
        url: String
        life_status: String
        backup_volume_id: String
        create_date: String
        update_date: String
        remove_date: String
        options: [DeviceOption]
        driver_container: Container
      }
      type DeviceBackup {
        id: String
        name: String
        device_id: String
        device_name: String
        container_id: String
        image_id: String
        create_date: String
        update_date: String
        remove_date: String
      }
      input DeviceInput {
        name: String
        inner_port: Int
        image: String
      }

      type ContainerDeviceAuxOption {
        id: String
        container_id: String
        device_id: String
        device_option_name: String
        container_option_value: String
      }

      input ContainerDeviceAuxOptionInput {
        key: String
        value: String
      }
      
      type ContainerDeviceEnvOption {
        id: String
        container_id: String
        device_id: String
        container_env_name: String
        device_option_name: String
      }

      input ContainerDeviceEnvOptionInput {
        key: String
        value: String
      }
      
      type ContainerDeviceDomain {
        id: String
        container_id: String
        device_id: String
        domain: String
        is_ssl: Int
      }

      input ContainerDeviceDomainInput {
        container_id: String
        device_id: String
        domain: String
        is_ssl: Int
      }
      
      type ContainerDeviceCertificate {
        id: String
        container_id: String
        device_id: String
        private_key_path: String
        public_key_path: String
      }

      input ContainerDeviceCertificateInput {
        container_id: String
        device_id: String
        private_key_path: String
        public_key_path: String
      }
      
      type ContainerDeviceDb {
        id: String
        container_id: String
        device_id: String
        db_host: String
        db_name: String
        db_user: String
        db_password: String
        db_protocol: String
      }

      input ContainerDeviceDbInput {
        container_id: String
        device_id: String
        db_host: String
        db_name: String
        db_user: String
        db_password: String
        db_protocol: String
      }

      type ContainerDeviceRepository {
        id: String
        container_id: String
        device_id: String
        repository: String
      }

      input ContainerDeviceRepositoryInput {
        container_id: String
        device_id: String
        repository: String
      }

      type Query {
        getDevice(id: String): Device
        getDevices: [Device]
        getDeviceManifest(id: String): Manifest
        getDeviceOptions(device_id: String): [DeviceOption]
        getContainerDeviceEnvOptions(container_id: String, device_id: String): [ContainerDeviceEnvOption]
        getContainerDeviceAuxOptions(container_id: String, device_id: String): [ContainerDeviceAuxOption]
        getContainerDeviceDomain(container_id: String, device_id: String): ContainerDeviceDomain
        getContainerDeviceCertificate(container_id: String, device_id: String): ContainerDeviceCertificate
        getContainerDeviceDb(container_id: String, device_id: String): ContainerDeviceDb
        getContainerDeviceRepository(container_id: String, device_id: String): ContainerDeviceRepository
      }

      type Mutation {
        addDevice(input: DeviceInput): Boolean
        removeDevice(id: String): Boolean
        setDeviceOptions(id: String, options: [DeviceOptionInput]): Boolean
        setDeviceVirtual(id: String, is_virtual: Int, virtual_device_container_id: String): Boolean
        addDeviceToContainer(container_id: String, input: ContainerDeviceInput): Boolean
        editDeviceOfContainer(container_id: String, input: ContainerDeviceInput): Boolean
        setContainerDeviceEnvOptions(container_id: String, device_id: String, options: [ContainerDeviceEnvOptionInput]): Boolean
        setContainerDeviceAuxOptions(container_id: String, device_id: String, options: [ContainerDeviceAuxOptionInput]): Boolean
        setContainerDeviceDomain(container_id: String, device_id: String, domain: ContainerDeviceDomainInput): Boolean
        setContainerDeviceCertificate(container_id: String, device_id: String, certificate: ContainerDeviceCertificateInput): Boolean
        setContainerDeviceDb(container_id: String, device_id: String, db: ContainerDeviceDbInput): Boolean
        setContainerDeviceRepository(container_id: String, device_id: String, repository: ContainerDeviceRepositoryInput): Boolean
        removeDeviceFromContainer(container_id: String, device_id: String): Boolean        
        createDeviceFromApp(app_id: String): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getDevice: resolver<{ id: string }, (DeviceTable & { options?: DeviceOptionTable[], driver_container?: ContainerTable })>(async (parent, args, context, info) => {
        const device: DeviceTable & { options?: DeviceOptionTable[], driver_container?: ContainerTable } = await DeviceModel.getDevice(args.id);
        device.options = await DeviceModel.getDeviceOptions(device.id);
        device.driver_container = await DeviceModel.getDeviceDriverContainer(device.id);
        return device;
      }),
      getDevices: resolver<void, (DeviceTable & { options?: DeviceOptionTable[], driver_container?: ContainerTable })[]>(async (parent, args, context, info) => {
        const results = await DeviceModel.getDevices() as (DeviceTable & { options: DeviceOptionTable[] })[];
        for (const k in results) {
          const device: DeviceTable & { options?: DeviceOptionTable[], driver_container?: ContainerTable } = results[k];
          device.options = await DeviceModel.getDeviceOptions(device.id);
          device.driver_container = await DeviceModel.getDeviceDriverContainer(device.id);
        }
        return results;
      }),
      getDeviceManifest: resolver<{ id: string }, Manifest>(async (parent, args, context, info) => {
        const deviceId = args.id;
        
        const driverContainer = await DeviceModel.getDeviceDriverContainer(deviceId);
        
        const device = new BaseDevice(driverContainer.outer_port);
        return device.getManifest();
      }),
      getDeviceOptions: resolver<{ device_id: string }, DeviceOptionTable[]>(async (parent, args, context, info) => {
        const deviceId = args.device_id;
        const options = await DeviceModel.getDeviceOptions(deviceId);
        return options;
      }),
      getContainerDeviceAuxOptions: resolver<{ container_id: string, device_id: string }, ContainerDeviceAuxOptionTable[]>(async (parent, args, context, info) => {
        const options = await DeviceModel.getDeviceAuxOptionsOfContainer(args.device_id, args.container_id);
        return options;
      }),
      getContainerDeviceDomain: resolver<{ container_id: string, device_id: string }, ContainerDeviceDomainTable>(async (parent, args, context, info) => {
        const options = await DeviceModel.getDeviceDomainOptionsOfContainer(args.device_id, args.container_id);
        return options;
      }),
      getContainerDeviceCertificate: resolver<{ container_id: string, device_id: string }, ContainerDeviceCertificateTable>(async (parent, args, context, info) => {
        const options = await DeviceModel.getDeviceCertificateOptionsOfContainer(args.device_id, args.container_id);
        return options;
      }),
      getContainerDeviceDb: resolver<{ container_id: string, device_id: string }, ContainerDeviceDbTable>(async (parent, args, context, info) => {
        const options = await DeviceModel.getDeviceDbOptionsOfContainer(args.device_id, args.container_id);
        return options;
      }),
      getContainerDeviceRepository: resolver<{ container_id: string, device_id: string }, ContainerDeviceRepositoryTable>(async (parent, args, context, info) => {
        const options = await DeviceModel.getDeviceRepositoryOptionsOfContainer(args.device_id, args.container_id);
        return options;
      }),
      getContainerDeviceEnvOptions: resolver<{ container_id: string, device_id: string }, ContainerDeviceEnvOptionTable[]>(async (parent, args, context, info) => {
        const options = await DeviceModel.getDeviceEnvsOfContainer(args.device_id, args.container_id);
        return options;
      }),
    },
    Mutation: {
      addDevice: resolver<{ input: DeviceInput }, boolean>(async (parent, args, context, info) => {
        const input = args.input;
        const appId = await AppAction.installApp(context.user.id, {
          name: input.name,
          images: [{
            name: input.name,
            image: input.image,
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
        if (appInstance) {
          await AppInstanceAction.removeAppInstance(appInstance.id, true);
        }
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
      setDeviceVirtual: resolver<{ id: string, is_virtual: number, virtual_device_container_id: string }, boolean>(async (parent, args, context, info) => {
        await DeviceModel.setDeviceVirtual(args.id, args.is_virtual, args.is_virtual ? args.virtual_device_container_id : null);
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
      setContainerDeviceEnvOptions: resolver<{ container_id: string, device_id: string, options: { key: string, value: string }[] }, boolean>(async (parent, args, context, info) => {
        await DeviceModel.setDeviceEnvOptionsOfContainer(args.device_id, args.container_id, args.options);
        return true;
      }),
      setContainerDeviceAuxOptions: resolver<{ container_id: string, device_id: string, options: { key: string, value: string }[] }, boolean>(async (parent, args, context, info) => {
        await DeviceModel.setDeviceAuxOptionsOfContainer(args.device_id, args.container_id, args.options);
        return true;
      }),
      setContainerDeviceDomain: resolver<{ container_id: string, device_id: string, domain: ContainerDeviceDomainTable }, boolean>(async (parent, args, context, info) => {
        await DeviceModel.setDeviceDomainOptionsOfContainer(args.device_id, args.container_id, args.domain);
        const container = await AppInstanceModel.getContainer(args.container_id);
        const deviceDriverContainer = await DeviceModel.getDeviceDriverContainer(args.device_id);
        const domainDevice = new DomainDevice(deviceDriverContainer.outer_port);
        await domainDevice.add(args.container_id, container.outer_port);
        return true;
      }),
      setContainerDeviceCertificate: resolver<{ container_id: string, device_id: string, certificate: ContainerDeviceCertificateTable }, boolean>(async (parent, args, context, info) => {
        await DeviceModel.setDeviceCertificateOptionsOfContainer(args.device_id, args.container_id, args.certificate);
        return true;
      }),
      setContainerDeviceDb: resolver<{ container_id: string, device_id: string, db: ContainerDeviceDbTable }, boolean>(async (parent, args, context, info) => {
        await DeviceModel.setDeviceDbOptionsOfContainer(args.device_id, args.container_id, args.db);
        return true;
      }),
      setContainerDeviceRepository: resolver<{ container_id: string, device_id: string, repository: ContainerDeviceRepositoryTable }, boolean>(async (parent, args, context, info) => {
        await DeviceModel.setDeviceRepositoryOptionsOfContainer(args.device_id, args.container_id, args.repository);
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