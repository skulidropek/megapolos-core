/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import { ContainerVolumeInput, resolver } from '../../types';
import EventsObserver from '../events/eventsObserver';
import { ContainerVolumeTable, DeviceBackupTable, VolumeTable } from '../models/tables';
import DatabaseDevice from '../devices/databaseDevice';
import BaseDevice from '../devices/baseDevice';
import Volume from '../../classes/Volume';
import DeviceBackup from '../../classes/DeviceBackup';
import Container from '../../classes/Container';

const volumeModule = createModule({
  id: 'volume-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      input Upload {
        filename: String!
        data: String!
      }
      
      type Volume {
        id: String
        name: String
        type: String
        outer_path: String
        node_id: String
        create_date: String
        update_date: String
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

      input VolumeInput {
        name: String
        type: String
        outer_path: String
      }

      type Query {
        getVolumes: [Volume]
        getDeviceBackups(device_name: String): [DeviceBackup]
      }

      type Mutation {
        addVolume(input: VolumeInput): Boolean
        deleteVolume(id: String): Boolean
        addVolumeToContainer(container_id: String, input: ContainerVolumeInput): ContainerVolume
        removeVolumeFromContainer(container_id: String, volume_id: String): Boolean
        uploadFileToVolume(volume_id: String, file: Upload!): Boolean
        setDeviceBackupVolume(device_id: String, volume_id: String): Boolean
        removeDeviceBackupVolume(device_id: String): Boolean
        downloadDeviceBackup(backup_id: String): String
        uploadDeviceBackup(device_id: String, name: String, file: Upload!): Boolean
        removeDeviceBackup(id: String): Boolean
        backupDevice(device_id: String, container_id: String): Boolean
        restoreDeviceBackup(device_id: String, backup_id: String, container_id: String): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getVolumes: resolver<void, VolumeTable[]>(async (parent, args, context, info) => {
        const volumes = Promise.all((await Volume.getVolumes()).map((volume) => volume.getData()));
        return volumes;
      }),
      getDeviceBackups: resolver<{ device_name: string }, DeviceBackupTable[]>(async (parent, args, context, info) => {
        const backups = Promise.all((await DeviceBackup.getBackups(args.device_name)).map((backup) => backup.getData()));
        return backups;
      }),
    },
    Mutation: {
      addVolume: resolver<{ input: Partial<VolumeTable> }, boolean>(async (parent, args, context, info) => {
        Volume.addVolume(args.input);
        EventsObserver.listener({ type: 'addVolume', data: args });
        return true;
      }),
      deleteVolume: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        const id = args.id;
        const volume = new Volume(id);
        await volume.delete();
        EventsObserver.listener({ type: 'deleteVolume', data: args });
        return true;
      }),
      addVolumeToContainer: resolver<{ container_id: string, input: ContainerVolumeInput }, ContainerVolumeTable>(async (parent, args, context, info) => {
        const containerVolume = await new Volume(args.input.volume).addToContainer(new Container(args.container_id), args.input);
        EventsObserver.listener({ type: 'addVolumeToContainer', data: args });
        return containerVolume;
      }),
      removeVolumeFromContainer: resolver<{ container_id: string, volume_id: string }, boolean>(async (parent, args, context, info) => {
        await new Volume(args.volume_id).removeFromContainer(new Container(args.container_id));
        EventsObserver.listener({ type: 'removeVolumeFromContainer', data: args });
        return true;
      }),
      uploadFileToVolume: resolver<{ volume_id: string, file: { filename: string, data: string } }, boolean>(async (parent, args, context, info) => {
        console.log(args.file.filename, args.file.data.slice(0, 100));
        new Volume(args.volume_id).uploadFile(args.file.filename, args.file.data);
        return true;
      }),
      uploadDeviceBackup: resolver<{ device_id: string, name: string, file: { filename: string, data: string } }, boolean>(async (parent, args, context, info) => {
        DeviceBackup.upload(args.device_id, args.name, args.file.filename, args.file.data);
        return true;
      }),
      downloadDeviceBackup: resolver<{ backup_id: string }, string>(async (parent, args, context, info) => {
        return new DeviceBackup(args.backup_id).download();
      }),
      removeDeviceBackup: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        await new DeviceBackup(args.id).remove();
        return true;
      }),
      setDeviceBackupVolume: resolver<{ device_id: string, volume_id: string }, boolean>(async (parent, args, context, info) => {
        await new BaseDevice(args.device_id).setBackupVolume(new Volume(args.volume_id));
        EventsObserver.listener({ type: 'setDeviceBackupVolume', data: args });
        return true;
      }),
      removeDeviceBackupVolume: resolver<{ device_id: string }, boolean>(async (parent, args, context, info) => {
        await new BaseDevice(args.device_id).removeBackupVolume();
        EventsObserver.listener({ type: 'removeDeviceBackupVolume', data: args });
        return true;
      }),
      backupDevice: resolver<{ device_id: string, container_id: string }, boolean>(async (parent, args, context, info) => {
        const databaseDevice = new DatabaseDevice(args.device_id);
        await databaseDevice.backup(args.container_id);
        return true;
      }),
      restoreDeviceBackup: resolver<{ device_id: string, backup_id: string, container_id: string }, boolean>(async (parent, args, context, info) => {
        const databaseDevice = new DatabaseDevice(args.device_id);
        await databaseDevice.restore(args.backup_id, args.container_id);
        return true;
      }),
    },
  },
});

export default volumeModule;