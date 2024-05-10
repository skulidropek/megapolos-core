/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../events/eventsObserver';
import { resolver } from '../../types';
import { DbBackupTable, DbSchemaSchema, DbTable, DbUserTable, DbmsTable } from '../models/tables';
import BaseDbms from '../../classes/BaseDbms';
import Dbms from '../../classes/Dbms';
import DbUser from '../../classes/DbUser';
import Db from '../../classes/Db';

const dbmsModule = createModule({
  id: 'dbms-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type Query {
        getDbmss: [Dbms]
        getDbms(id: String!): Dbms
        compareDbs(dbId1: String! dbId2: String!): [String]
      }
      type Mutation {
        createDbms(dbms: DbmsInput): Dbms
        removeDbms(id: String!): Boolean
        editDbms(id: String! dbms: DbmsInput): Dbms
        createDb(db: DbInput! withoutChange: Boolean): Db
        createDbUser(user: DbUserInput! withoutChange: Boolean): DbUser
        addDbUserToDb(userId: String! dbId: String! withoutChange: Boolean): Boolean
        backupDb(dbId: String!): DbBackup
        restoreDb(dbId: String! backupId: String!): Boolean
      }
      type DbSchemaSchemaField {
        name: String
        type: String
      }
      type DbSchemaSchemaTable {
        name: String
        fields: [DbSchemaSchemaField]
      }
      type DbSchemaSchema {
        tables: [DbSchemaSchemaTable]
      }
        type Dbms {
            id: String
            name: String
            host: String
            user: String
            password: String
            create_date: DateTime
            update_date: DateTime
            remove_date: DateTime
            dbs: [Db]
            users: [DbUser]
            type: String
        }
        input DbmsInput {
            name: String
            host: String
            user: String            
            password: String
            type: String
        }
        type Db {
            id: String
            name: String
            dbms: Dbms
            create_date: DateTime
            update_date: DateTime
            users: [DbUser]
            schema: DbSchemaSchema
        }

        input DbInput {
            name: String
            dbms_id: String
        }

        type DbBackup {
          id: String
          name: String
          type: String
          create_date: DateTime
          update_date: DateTime
        }

        type DbUser {
            id: String
            name: String
            dbms: Dbms
            create_date: DateTime
            update_date: DateTime
            dbs: [Db]
        }

        input DbUserInput {
            name: String
            dbms_id: String
        }
    `,
  ],
  resolvers: {
    Query: {
      getDbmss: resolver<{}, DbmsTable[]>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'getDbmss', data: args });
        return new BaseDbms().getAll();
      }),
      getDbms: resolver<{ id: string }, DbmsTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'getDbms', data: args });
        return (await Dbms.getById(args.id)).getData();
      }),
      compareDbs: resolver<{ dbId1: string, dbId2: string }, string[]>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'compareDbs', data: args });
        return Dbms.compareDbs(args.dbId1, args.dbId2);
      }),
    },
    Mutation: {
      createDbms: resolver<{ dbms: Partial<DbmsTable> }, DbmsTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'createDbms', data: args });
        return (await Dbms.getByType(args.dbms.type)).create(args.dbms);
      }),
      editDbms: resolver<{ id: string, dbms: Partial<DbmsTable> }, DbmsTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'editDbms', data: args });
        return (await Dbms.getById(args.id)).edit(args.dbms);
      }),
      removeDbms: resolver<{ id: string }, boolean>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'removeDbms', data: args });
        await (await Dbms.getById(args.id)).delete();
        return true;
      }),
      createDb: resolver<{ db: Partial<DbTable>, withoutChange: boolean }, DbTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'createDb', data: args });
        return (await Dbms.getById(args.db.dbms_id)).createDb(args.db, args.withoutChange);
      }),
      createDbUser: resolver<{ user: Partial<DbUserTable>, withoutChange: boolean }, DbUserTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'createDbUser', data: args });
        return (await Dbms.getById(args.user.dbms_id)).createUser(args.user, args.withoutChange);
      }),
      addDbUserToDb: resolver<{ userId: string, dbId: string, withoutChange: boolean }, boolean>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'addDbUserToDb', data: args });
        return (await Dbms.getById(args.userId)).addUserToDb(args.userId, args.dbId, args.withoutChange);
      }),
      backupDb: resolver<{ dbId: string }, DbBackupTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'backupDb', data: args });
        const db = await new Db(args.dbId).getData();
        const dbms = await Dbms.getById(db.dbms_id);
        return dbms.backup(db.id);
      }),
      restoreDb: resolver<{ dbId: string, backupId: string }, boolean>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'restoreDb', data: args });
        const db = await new Db(args.dbId).getData();
        const dbms = await Dbms.getById(db.dbms_id);
        return dbms.restore(db.id, args.backupId);
      }),
    },
    Dbms: {
      dbs: resolver<DbmsTable, DbTable[]>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'Dbms.dbs', data: args });
        return (await Dbms.getById(parent.id)).getDbs();
      }),
      users: resolver<DbmsTable, DbUserTable[]>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'Dbms.users', data: args });
        return (await Dbms.getById(parent.id)).getUsers();
      }),
    },
    Db: {
      dbms: resolver<DbTable, DbmsTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'Db.dbms', data: args });
        return new Db(parent.id).getDbms();
      }),
      users: resolver<DbTable, DbUserTable[]>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'Db.users', data: args });
        return new Db(parent.id).getUsers();
      }),
      schema: resolver<DbTable, DbSchemaSchema>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'Db.schema', data: args });
        return (await Dbms.getById(parent.dbms_id)).getSchema(parent.name);
      }),
    },
    DbUser: {
      dbms: resolver<DbUserTable, DbmsTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'DbUser.dbms', data: args });
        return new DbUser(parent.id).getDbms();
      }),
      dbs: resolver<DbUserTable, DbTable[]>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'DbUser.dbs', data: args });
        return new DbUser(parent.id).getDbs();
      }),
    },
  },
});

export default dbmsModule;