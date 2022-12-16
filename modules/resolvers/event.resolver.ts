import { createModule, gql } from 'graphql-modules';
import { resolver } from '../../types';
import EventsObserver from '../events/eventsObserver';

interface BuildEventInput {
  container_id: string;
}

const eventModule = createModule({
  id: 'event-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      input BuildEventInput {
        container_id: String
      }

      type Mutation {
        eventBuildEnded(input: BuildEventInput): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
    },
    Mutation: {
      eventBuildEnded: resolver<{ input: BuildEventInput }, boolean>(async (parent, args, context, info) => {
        EventsObserver.listener({
          type: 'buildEnded',
          data: {
            containerId: args.input.container_id,
          },
        });
        return true;
      }),
    },
  },
});

export default eventModule;