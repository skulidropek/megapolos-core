/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { resolver } from '../../types';
import { createModule, gql } from 'graphql-modules';
import { ResourceTable } from '../models/tables';
import Container from '../../classes/Container';

const resourceModule = createModule({
  id: 'resource-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type Resource {
        id: String!
        name: String!
        device_id: String!
        resource_type: String!
        resource_kind: String!
      }

      type Query {
        getResourcesOfContainer: [Resource]
      }

      #type Mutation {
      #}
    `,
  ],
  resolvers: {
    Query: {
      getResourcesOfContainer: resolver<{ id: string }, ResourceTable[]>(async (parent, args, context, info) => {
        return Promise.all((await new Container(args.id).getResources()).map(resource => resource.getData()));
      }),
    },
    Mutation: {

    },
  },
});

export default resourceModule;