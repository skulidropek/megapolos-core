import { createModule, gql } from 'graphql-modules';
import { v4 as uuidv4 } from 'uuid';
import { resolver } from '../../types';
import EventsObserver from '../events/eventsObserver';
import VolumeModel from '../models/volume.model';
import { VolumeTable } from '../models/tables';
import { megapolosPath } from '../..';
import { promises as fs } from 'fs';
import fsSync from 'fs';

const volumeModule = createModule({
  id: 'volume-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type Volume {
        id: String
        name: String
        type: String
        outer_path: String
        node_id: String
        create_date: String
        update_date: String
      }

      input VolumeInput {
        name: String
        type: String
        outer_path: String
      }

      type Query {
        getVolumes: [Volume]
      }

      type Mutation {
        addVolume(input: VolumeInput): Boolean
        deleteVolume(id: String): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getVolumes: resolver<void, VolumeTable[]>(async (parent, args, context, info) => {
        const volumes = await VolumeModel.getVolumes();
        return volumes;
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
    },
  },
});

export default volumeModule;