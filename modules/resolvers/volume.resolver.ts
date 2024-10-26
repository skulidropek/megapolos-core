/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import { ContainerVolumeInput, resolver } from '../../types';
import EventsObserver from '../events/eventsObserver';
import { ContainerVolumeTable, DeviceBackupTable, VolumeTable } from '../models/tables';
import Volume from '../../classes/Volume';
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
        create_date: DateTime
        update_date: DateTime
      }

      type DeviceBackup {
        id: String
        name: String
        device_id: String
        container_id: String
        image_id: String
        create_date: DateTime
        update_date: DateTime
        remove_date: DateTime
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
        removeVolumeFromContainer(id: String container_id: String): Boolean
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
        return new Volume().getAll();
      }),
    },
    Mutation: {
      addVolume: resolver<{ input: Partial<VolumeTable> }, boolean>(async (parent, args, context, info) => {
        await new Volume().create(args.input);
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
        const containerVolume = await new Volume(args.input.volume).addToContainer(args.container_id, args.input);
        EventsObserver.listener({ type: 'addVolumeToContainer', data: args });
        return containerVolume;
      }),
      removeVolumeFromContainer: resolver<{ id: string, container_id: string }, boolean>(async (parent, args, context, info) => {
        await new Container(args.container_id).removeVolume(args.id);
        EventsObserver.listener({ type: 'removeVolumeFromContainer', data: args });
        return true;
      }),
      uploadFileToVolume: resolver<{ volume_id: string, file: { filename: string, data: string } }, boolean>(async (parent, args, context, info) => {
        console.log(args.file.filename, args.file.data.slice(0, 100));
        new Volume(args.volume_id).uploadFile(args.file.filename, args.file.data);
        return true;
      }),
    },
  },
});

export default volumeModule;