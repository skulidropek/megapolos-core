/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../events/eventsObserver';
import { resolver } from '../../types';
import Megapolos, { SearchResult } from '../../classes/Megapolos';

const megapolosModule = createModule({
  id: 'megapolos-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type Query {
        globalSearch(query: String!): [SearchResult]
      }
        type SearchResult {
            id: String
            name: String
            type: String
        }
    `,
  ],
  resolvers: {
    Query: {
      globalSearch: resolver<{ query: string }, SearchResult[]>(async (parent, args) => {
        EventsObserver.listener({ type: 'globalSearch', data: args });
        return new Megapolos().globalSearch(args.query);
      }),
    },
  },
});

export default megapolosModule;