/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../events/eventsObserver';
import { resolver } from '../../types';
import { DomainTable } from '../models/tables';
import Domain from '../../classes/Domain';

const domainModule = createModule({
  id: 'domain-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type Query {
        getDomains: [Domain]
        getDomain(id: String!): Domain
      }
      type Mutation {
        createDomain(domain: DomainInput): Domain
        removeDomain(id: String!): Domain
        editDomain(id: String! domain: DomainInput): Domain
      }
        type Domain {
            id: String
            name: String
            auth: String
            user: String
            password: String
            create_date: DateTime
            update_date: DateTime
            remove_date: DateTime
        }
        input DomainInput {
            name: String
            auth: String
            user: String
            password: String
        }
    `,
  ],
  resolvers: {
    Query: {
      getDomains: resolver<{}, DomainTable[]>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'getDomains', data: args });
        return Domain.getAllData();
      }),
      getDomain: resolver<{ id: string }, DomainTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'getDomain', data: args });
        return new Domain(args.id).getData();
      }),
    },
    Mutation: {
      createDomain: resolver<{ domain: Partial<DomainTable> }, DomainTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'createDomain', data: args });
        return (await Domain.create(args.domain)).getData();
      }),
      editDomain: resolver<{ id: string, domain: Partial<DomainTable> }, DomainTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'editDomain', data: args });
        const domain = new Domain(args.id);
        await domain.edit(args.domain);
        return domain.getData();
      }),
    },
  },
});

export default domainModule;