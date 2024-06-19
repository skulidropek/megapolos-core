/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { resolver } from '../../types';
import { createModule, gql } from 'graphql-modules';
import { ResourceCertificateTable, ResourceDbTable, ResourceDockerImageTable, ResourceDomainTable, ResourceRepositoryTable, ResourceTable } from '../models/tables';
import Container from '../../classes/Container';
import CertificateResource from '../resources/CertificateResource';
import DbResource from '../resources/DbResource';
import DomainResource from '../resources/DomainResource';
import RepositoryResource from '../resources/RepositoryResource';
import DockerImageResource from '../resources/DockerImageResource';

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

      type Domain {
        id: String!
        domain: String!
        is_ssl: Boolean!
        resource: Resource!
      }

      type Certificate {
        id: String!
        domain: String!
        private_key_path: String!
        public_key_path: String!
        resource: Resource!
      }

      type Database {
        id: String!
        db_host: String!
        db_name: String!
        db_user: String!
        db_password: String!
        db_protocol: String!
        resource: Resource!
      }

      type Query {
        getResourcesOfContainer: [Resource]
        getCertificates: [Certificate]
        getDatabases: [Database]
        getDomains: [Domain]
      }

      type Mutation {
        addResourceToContainer(container_id: String!, resource_id: String!): Boolean
        removeResourceFromContainer(container_id: String!, resource_id: String!): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getResourcesOfContainer: resolver<{ id: string }, ResourceTable[]>(async (parent, args, context, info) => {
        return Promise.all((await new Container(args.id).getResources()).map(resource => resource.getData()));
      }),
      getCertificates: resolver<{ id: string }, (ResourceCertificateTable & { resource: ResourceTable })[]>(async (parent, args, context, info) => {
        return Promise.all((await CertificateResource.getCertificates()).map(async resource => {
          return {
            ...await resource.getCertificateData(),
            resource: await resource.getData(),
          };
        }));
      }),
      getDatabases: resolver<void, (ResourceDbTable & { resource: ResourceTable })[]>(async (parent, args, context, info) => {
        return Promise.all((await DbResource.getDatabases()).map(async resource => {
          const dbData = await resource.getDbData();
          dbData.db_password = '';
          return {
            ...dbData,
            resource: await resource.getData(),
          };
        }));
      }),
      getDomains: resolver<void, (ResourceDomainTable & { resource: ResourceTable })[]>(async (parent, args, context, info) => {
        return Promise.all((await DomainResource.getDomains()).map(async resource => {
          return {
            ...await resource.getDomainData(),
            resource: await resource.getData(),
          };
        }));
      }),
    },
    Mutation: {

    },
  },
});

export default resourceModule;