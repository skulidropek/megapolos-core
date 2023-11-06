/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import { resolver } from '../../types';
import EventsObserver from '../events/eventsObserver';
import { JSONResolver } from 'graphql-scalars';


interface BuildEventInput {
  container_id: string;
}

const eventModule = createModule({
  id: 'event-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      scalar JSON

      input BuildEventInput {
        container_id: String
      }

      type Mutation {
        eventBuildEnded(input: BuildEventInput): Boolean
      }

      type Event {
        type: String
        data: JSON
      }

      type Subscription {
        event: Event
      }
    `,
  ],
  resolvers: {
    JSON: JSONResolver,
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
    Subscription: {
      event: {
        subscribe() {
          return EventsObserver.getIterator();
        },
      },
    },
  },
});

export default eventModule;