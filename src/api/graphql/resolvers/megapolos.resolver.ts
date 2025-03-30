/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../../../features/events/eventsObserver';
import { resolver } from '../../../domain/types';
import { knex } from '../../../features/db/knex';

export interface SearchResult {
  id: string;
  name: string;
  type: 'repository' | 'app' | 'image' | 'container' | 'node' | 'domain' | 'user' |
  'dbms' | 'db' | 'db_user' | 'db_backup' | 'db_schema' | 'app_instance' | 'log' | 'volume';
}

class Megapolos {
  async globalSearch(query: string): Promise<SearchResult[]> {
    const result: SearchResult[] = [];
    const tables = [
      'repository', 'app', 'image', 'container', 'node', 'domain', 'user',
      'dbms', 'db', 'db_user', 'db_backup', 'db_schema', 'app_instance', 'log', 'volume',
    ];
    for (const i in tables) {
      const table = tables[i];
      const data = await knex(table).select(['id', 'name']).where('name', 'like', `%${query}%`);
      result.push(...data.map((item: SearchResult) => ({ ...item, type: table as SearchResult['type'] })));
    }
    return result;
  }
}

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