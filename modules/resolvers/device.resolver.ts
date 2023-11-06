/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { ContainerDeviceInput, DeviceInput, resolver } from '../../types';
import DeviceModel from '../models/device.model';
import AppInstanceModel from '../models/appInstance.model';
import BaseDevice, { Manifest } from '../devices/baseDevice';
import AppAction from '../actions/app.action';
import AppInstanceAction from '../actions/appInstance.action';
import { createModule, gql } from 'graphql-modules';
import { ContainerDeviceCertificateTable, ContainerDeviceDbTable, ContainerDeviceDomainTable, ContainerDeviceAuxOptionTable, DeviceOptionTable, DeviceTable, ContainerDeviceEnvOptionTable, ContainerTable, ContainerDeviceRepositoryTable } from '../models/tables';
import EventsObserver from '../events/eventsObserver';
import AppModel from '../models/app.model';
import DeviceAction from '../actions/device.action';
import DomainDevice from '../devices/domainDevice';
import CertificateDevice from '../devices/certificateDevice';
import DatabaseDevice from '../devices/databaseDevice';
import RepositoryDevice from '../devices/repositoryDevice';

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
        const device = new BaseDevice(args.id);
        const result: DeviceTable & { options?: DeviceOptionTable[], driver_container?: ContainerTable } = await device.getData();
        result.options = await device.getOptions();
        result.driver_container = await (await device.getDriverContainer()).getData();
        return result;
      }),
      getDevices: resolver<void, (DeviceTable & { options?: DeviceOptionTable[], driver_container?: ContainerTable })[]>(async (parent, args, context, info) => {
        const results: (DeviceTable & { options: DeviceOptionTable[] })[] = [];
        const devices = await BaseDevice.getDevices();
        for (const k in devices) {
          const device = new BaseDevice(devices[k].id);
          const result: DeviceTable & { options?: DeviceOptionTable[], driver_container?: ContainerTable } = await device.getData();
          result.options = await device.getOptions();
          result.driver_container = await (await device.getDriverContainer()).getData();
        }
        return results;
      }),
      getDeviceManifest: resolver<{ id: string }, Manifest>(async (parent, args, context, info) => {
        const deviceId = args.id;
        
        const device = new BaseDevice(deviceId);
        return device.getManifest();
      }),
      getDeviceOptions: resolver<{ device_id: string }, DeviceOptionTable[]>(async (parent, args, context, info) => {
        const options = new BaseDevice(args.device_id).getOptions();
        return options;
      }),
      getContainerDeviceAuxOptions: resolver<{ container_id: string, device_id: string }, ContainerDeviceAuxOptionTable[]>(async (parent, args, context, info) => {
        const options = new BaseDevice(args.device_id).getContainerAuxOptions(args.container_id);
        return options;
      }),
      getContainerDeviceDomain: resolver<{ container_id: string, device_id: string }, ContainerDeviceDomainTable>(async (parent, args, context, info) => {
        const options = await new DomainDevice(args.device_id).getDomainOptionsOfContainer(args.container_id);
        return options;
      }),
      getContainerDeviceCertificate: resolver<{ container_id: string, device_id: string }, ContainerDeviceCertificateTable>(async (parent, args, context, info) => {
        const options = await new CertificateDevice(args.device_id).getCertificateOptionsOfContainer(args.container_id);
        return options;
      }),
      getContainerDeviceDb: resolver<{ container_id: string, device_id: string }, ContainerDeviceDbTable>(async (parent, args, context, info) => {
        const options = await new DatabaseDevice(args.device_id).getDbOptionsOfContainer(args.container_id);
        return options;
      }),
      getContainerDeviceRepository: resolver<{ container_id: string, device_id: string }, ContainerDeviceRepositoryTable>(async (parent, args, context, info) => {
        const options = await new RepositoryDevice(args.device_id).getRepositoryOptionsOfContainer(args.container_id);
        return options;
      }),
      getContainerDeviceEnvOptions: resolver<{ container_id: string, device_id: string }, ContainerDeviceEnvOptionTable[]>(async (parent, args, context, info) => {
        const options = new BaseDevice(args.device_id).getContainerEnvOptions(args.container_id);
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
        await new BaseDevice(args.id).setOptions(args.options);
        return true;
      }),
      setDeviceVirtual: resolver<{ id: string, is_virtual: number, virtual_device_container_id: string }, boolean>(async (parent, args, context, info) => {
        await new BaseDevice(args.id).setVirtual(args.is_virtual, args.virtual_device_container_id);
        return true;
      }),
      addDeviceToContainer: resolver<{ container_id: string, input: ContainerDeviceInput }, boolean>(async (parent, args, context, info) => {
        await (await BaseDevice.getDeviceWithType(args.input.id)).addToContainer(args.container_id, args.input);
        EventsObserver.listener({ type: 'addDeviceToContainer', data: args });
        return true;
      }),
      editDeviceOfContainer: resolver<{ container_id: string, input: ContainerDeviceInput }, boolean>(async (parent, args, context, info) => {
        await (await BaseDevice.getDeviceWithType(args.input.id)).setContainerOptions(args.container_id, args.input);
        EventsObserver.listener({ type: 'editDeviceOfContainer', data: args });
        return true;
      }),
      setContainerDeviceEnvOptions: resolver<{ container_id: string, device_id: string, options: { key: string, value: string }[] }, boolean>(async (parent, args, context, info) => {
        await new BaseDevice(args.device_id).setContainerEnvOptions(args.container_id, args.options); 
        return true;
      }),
      setContainerDeviceAuxOptions: resolver<{ container_id: string, device_id: string, options: { key: string, value: string }[] }, boolean>(async (parent, args, context, info) => {
        await new BaseDevice(args.device_id).setContainerAuxOptions(args.container_id, args.options);
        return true;
      }),
      setContainerDeviceDomain: resolver<{ container_id: string, device_id: string, domain: ContainerDeviceDomainTable }, boolean>(async (parent, args, context, info) => {
        const domainDevice = new DomainDevice(args.device_id);
        await domainDevice.setDomainOptionsOfContainer(args.container_id, args.domain);
        await domainDevice.add(args.container_id);
        return true;
      }),
      setContainerDeviceCertificate: resolver<{ container_id: string, device_id: string, certificate: ContainerDeviceCertificateTable }, boolean>(async (parent, args, context, info) => {
        await new CertificateDevice(args.device_id).setCertificateOptionsOfContainer(args.container_id, args.certificate);
        return true;
      }),
      setContainerDeviceDb: resolver<{ container_id: string, device_id: string, db: ContainerDeviceDbTable }, boolean>(async (parent, args, context, info) => {
        await new DatabaseDevice(args.device_id).setDbOptionsOfContainer(args.container_id, args.db);
        return true;
      }),
      setContainerDeviceRepository: resolver<{ container_id: string, device_id: string, repository: ContainerDeviceRepositoryTable }, boolean>(async (parent, args, context, info) => {
        await new RepositoryDevice(args.device_id).setRepositoryOptionsOfContainer(args.container_id, args.repository);
        return true;
      }),
      removeDeviceFromContainer: resolver<{ container_id: string, device_id: string }, boolean>(async (parent, args, context, info) => {
        await (await BaseDevice.getDeviceWithType(args.device_id)).removeFromContainer(args.container_id);
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