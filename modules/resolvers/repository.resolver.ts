/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../events/eventsObserver';
import { resolver } from '../../types';
import { RepositoryTable } from '../models/tables';
import Repository from '../../classes/Repository';

const repositoryModule = createModule({
  id: 'repository-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type Query {
        getRepositories: [Repository]
        getRepository(id: String!): Repository
        getBranches(id: String!): [String]
        listRepositoryFiles(id: String! branch: String! path: String!): RepositoryFiles
        showRepositoryFile(id: String! branch: String! path: String!): String
      }
      type Mutation {
        createRepository(repository: RepositoryInput): Repository
        removeRepository(id: String!): Boolean
        editRepository(id: String! repository: RepositoryInput): Repository
        fetchRepository(id: String!): Boolean
      }
        type Repository {
            id: String
            name: String
            url: String
            user: String
            password: String
            create_date: DateTime
            update_date: DateTime
            remove_date: DateTime
            branches: [String]
            last_fetch_date: DateTime
        }
        type RepositoryFiles {
          files: [String]
          directories: [String]
        }
        input RepositoryInput {
            name: String
            url: String
            user: String
            password: String
        }
    `,
  ],
  resolvers: {
    Query: {
      getRepositories: resolver<{}, RepositoryTable[]>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'getRepositories', data: args });
        return Repository.getAllData();
      }),
      getRepository: resolver<{ id: string }, RepositoryTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'getRepository', data: args });
        return new Repository(args.id).getData();
      }),
      getBranches: resolver<{ id: string }, string[]>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'getBranches', data: args });
        return new Repository(args.id).getBranches();
      }),
      listRepositoryFiles: resolver<{ id: string, branch: string, path: string }, 
      { files: string[], directories: string[] }
      >(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'listRepositoryFiles', data: args });
        return new Repository(args.id).listFiles(args.branch, args.path);
      }),
      showRepositoryFile: resolver<{ id: string, branch: string, path: string }, string>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'showRepositoryFile', data: args });
        return new Repository(args.id).showFile(args.branch, args.path);
      }),
    },
    Mutation: {
      createRepository: resolver<{ repository: Partial<RepositoryTable> }, RepositoryTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'createRepository', data: args });
        return (await Repository.create(args.repository)).getData();
      }),
      fetchRepository: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'fetchRepository', data: args });
        await new Repository(args.id).fetch();
        return true;
      }),
      editRepository: resolver<{ id: string, repository: Partial<RepositoryTable> }, RepositoryTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'editRepository', data: args });
        return (await new Repository(args.id).edit(args.repository)).getData();
      }),
      removeRepository: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'removeRepository', data: args });
        await new Repository(args.id).remove();
        return true;
      }),
    },
    Repository: {
      branches: resolver<RepositoryTable, string[]>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'getBranches', data: args });
        return new Repository(parent.id).getBranches();
      }),
    },
  },
});

export default repositoryModule;