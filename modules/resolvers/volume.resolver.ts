import decompress from 'decompress';
import { createModule, gql } from 'graphql-modules';
import { v4 as uuidv4 } from 'uuid';
import { ContainerVolumeInput, resolver } from '../../types';
import EventsObserver from '../events/eventsObserver';
import VolumeModel from '../models/volume.model';
import { ContainerVolumeTable, DeviceBackupTable, VolumeTable } from '../models/tables';
import { megapolosPath } from '../..';
import { promises as fs } from 'fs';
import fsSync from 'fs';
import AdmZip from 'adm-zip';
import AppInstanceAction from '../actions/appInstance.action';
import DeviceModel from '../models/device.model';
import DatabaseDevice from '../devices/databaseDevice';

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
        getDeviceBackups(device_id: String): [DeviceBackup]
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
        const volumes = await VolumeModel.getVolumes();
        return volumes;
      }),
      getDeviceBackups: resolver<{ device_id: string }, DeviceBackupTable[]>(async (parent, args, context, info) => {
        const backups = await VolumeModel.getDeviceBackups(args.device_id);
        return backups;
      }),
    },
    Mutation: {
      addVolume: resolver<{ input: Partial<VolumeTable> }, boolean>(async (parent, args, context, info) => {
        const id = uuidv4();
        args.input.id = id;
        
        if (args.input.type === 'auto' || args.input.type === 'dynamic_auto') {
          const megapolosVolume = megapolosPath + '/volumes/' + id;
          if (!fsSync.existsSync(megapolosVolume)) {
            await fs.mkdir(megapolosVolume);
          }
          args.input.outer_path = megapolosVolume;
        }
        await VolumeModel.addVolume(args.input);
        EventsObserver.listener({ type: 'addVolume', data: args });
        return true;
      }),
      deleteVolume: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        const id = args.id;
        const volume = await VolumeModel.getVolume(id);
        if (volume.type === 'auto' || volume.type === 'dynamic_auto') {
          const megapolosVolume = megapolosPath + '/volumes/' + id;
          if (fsSync.existsSync(megapolosVolume)) {
            await fs.rmdir(megapolosVolume, { recursive: true });
          }
        }
        await VolumeModel.deleteVolume(id);
        EventsObserver.listener({ type: 'deleteVolume', data: args });
        return true;
      }),
      addVolumeToContainer: resolver<{ container_id: string, input: ContainerVolumeInput }, ContainerVolumeTable>(async (parent, args, context, info) => {
        const containerVolume = await AppInstanceAction.addVolumeToContainer(args.container_id, args.input);
        EventsObserver.listener({ type: 'addVolumeToContainer', data: args });
        return containerVolume;
      }),
      removeVolumeFromContainer: resolver<{ container_id: string, volume_id: string }, boolean>(async (parent, args, context, info) => {
        await AppInstanceAction.removeVolumeFromContainer(args.container_id, args.volume_id);
        EventsObserver.listener({ type: 'removeVolumeFromContainer', data: args });
        return true;
      }),
      uploadFileToVolume: resolver<{ volume_id: string, file: { filename: string, data: string } }, boolean>(async (parent, args, context, info) => {
        console.log(args.file.filename, args.file.data.slice(0, 100));
        const volume = await VolumeModel.getVolume(args.volume_id);
        if (!volume) {
          throw new Error('Volume not found');
        }
        await fs.writeFile(volume.outer_path + '/' + args.file.filename, args.file.data, 'base64');
        return true;
      }),
      uploadDeviceBackup: resolver<{ device_id: string, name: string, file: { filename: string, data: string } }, boolean>(async (parent, args, context, info) => {
        const device = await DeviceModel.getDevice(args.device_id);
        const volume = await VolumeModel.getVolume(device.backup_volume_id);
        if (!volume) {
          throw new Error('Volume not found');
        }
        const backupId = uuidv4();
        const backupArchivePath = volume.outer_path + '/' + backupId + '.zip';
        const backupPath = volume.outer_path + '/' + backupId;
        await fs.writeFile(backupArchivePath, args.file.data, 'base64');
        await fs.mkdir(backupPath);
        await decompress(backupArchivePath, backupPath);
        await fs.unlink(backupArchivePath);
        await VolumeModel.addDeviceBackup({
          id: backupId,
          device_id: args.device_id,
          name: args.name,
        });
        return true;
      }),
      downloadDeviceBackup: resolver<{ backup_id: string }, string>(async (parent, args, context, info) => {
        const backup = await VolumeModel.getDeviceBackup(args.backup_id);
        const device = await DeviceModel.getDevice(backup.device_id);
        const volume = await VolumeModel.getVolume(device.backup_volume_id);
        if (!volume) {
          throw new Error('Volume not found');
        }
        const backupPath = volume.outer_path + '/' + backup.id;
        const zip = new AdmZip();
        zip.addLocalFolder(backupPath);
        const zipData = zip.toBuffer();
        return zipData.toString('base64');
      }),
      removeDeviceBackup: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        const backup = await VolumeModel.getDeviceBackup(args.id);
        const device = await DeviceModel.getDevice(backup.device_id);
        const volume = await VolumeModel.getVolume(device.backup_volume_id);
        if (!volume) {
          throw new Error('Volume not found');
        }
        const backupPath = volume.outer_path + '/' + backup.id;
        if (!backupPath.startsWith(megapolosPath)) {
          throw new Error('Invalid backup path');
        }
        await fs.rmdir(backupPath, { recursive: true });
        await VolumeModel.deleteDeviceBackup(args.id);
        return true;
      }),
      setDeviceBackupVolume: resolver<{ device_id: string, volume_id: string }, boolean>(async (parent, args, context, info) => {
        await VolumeModel.setDeviceBackupVolume(args.device_id, args.volume_id);
        EventsObserver.listener({ type: 'setDeviceBackupVolume', data: args });
        return true;
      }),
      removeDeviceBackupVolume: resolver<{ device_id: string }, boolean>(async (parent, args, context, info) => {
        await VolumeModel.removeDeviceBackupVolume(args.device_id);
        EventsObserver.listener({ type: 'removeDeviceBackupVolume', data: args });
        return true;
      }),
      backupDevice: resolver<{ device_id: string, container_id: string }, boolean>(async (parent, args, context, info) => {
        const deviceContainer = await DeviceModel.getDeviceContainer(args.device_id);
        const databaseDevice = new DatabaseDevice(deviceContainer.outer_port);
        const backupId = uuidv4();
        await databaseDevice.backup(backupId, args.container_id);
        await VolumeModel.addDeviceBackup({
          id: backupId,
          device_id: args.device_id,
          container_id: args.container_id,
        });
        return true;
      }),
      restoreDeviceBackup: resolver<{ device_id: string, backup_id: string, container_id: string }, boolean>(async (parent, args, context, info) => {
        const deviceContainer = await DeviceModel.getDeviceContainer(args.device_id);
        const databaseDevice = new DatabaseDevice(deviceContainer.outer_port);
        await databaseDevice.restore(args.backup_id, args.container_id);
        return true;
      }),
    },
  },
});

export default volumeModule;