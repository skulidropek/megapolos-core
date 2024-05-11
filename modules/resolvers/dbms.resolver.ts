/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../events/eventsObserver';
import { resolver } from '../../types';
import { DbBackupTable, DbSchemaSchema, DbSchemaTable, DbTable, DbUserTable, DbmsTable } from '../models/tables';
import BaseDbms from '../../classes/BaseDbms';
import Dbms from '../../classes/Dbms';
import DbUser from '../../classes/DbUser';
import Db from '../../classes/Db';
import DbBackup from '../../classes/DbBackup';
import DbSchema from '../../classes/DbSchema';

const dbmsModule = createModule({
  id: 'dbms-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type Query {
        getDbmss: [Dbms]
        getDbms(id: String!): Dbms
        getDbs: [Db]
        getDb(id: String!): Db
        getDbBackups: [DbBackup]
        getDbBackup(id: String!): DbBackup
        getDbSchemas: [DbSchema]
        getDbSchema(id: String!): DbSchema
        compareDbs(dbId1: String! dbId2: String!): [String]
        downloadBackupText(dbmsId: String! backupId: String!): String
      }
      type Mutation {
        createDbms(dbms: DbmsInput): Dbms
        removeDbms(id: String!): Boolean
        editDbms(id: String! dbms: DbmsInput): Dbms
        createDb(db: DbInput! withoutChange: Boolean): Db
        createDbUser(user: DbUserInput! withoutChange: Boolean): DbUser
        addDbUserToDb(userId: String! dbId: String! withoutChange: Boolean): Boolean
        saveDbSchema(dbId: String! name: String!): DbSchema
        backupDb(dbId: String!): DbBackup
        restoreDb(dbId: String! backupId: String!): Boolean
        uploadBackupText(dbmsId: String! backupText: String!): DbBackup
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
      type DbSchema {
        id: String
        name: String
        schema: DbSchemaSchema
        create_date: DateTime
        update_date: DateTime
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
      getDbs: resolver<{}, DbTable[]>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'getDbs', data: args });
        return new Db().getAll();
      }),
      getDb: resolver<{ id: string }, DbTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'getDb', data: args });
        return new Db(args.id).getData();
      }),
      getDbBackups: resolver<{}, DbBackupTable[]>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'getDbBackups', data: args });
        return new DbBackup().getAll();
      }),
      getDbBackup: resolver<{ id: string }, DbBackupTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'getDbBackup', data: args });
        return new DbBackup(args.id).getData();
      }),
      getDbSchemas: resolver<{}, DbSchemaTable[]>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'getDbSchemas', data: args });
        return new DbSchema().getAll();
      }),
      getDbSchema: resolver<{ id: string }, DbSchemaTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'getDbSchema', data: args });
        return new DbSchema(args.id).getData();
      }),
      compareDbs: resolver<{ dbId1: string, dbId2: string }, string[]>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'compareDbs', data: args });
        return Dbms.compareDbs(args.dbId1, args.dbId2);
      }),
      downloadBackupText: resolver<{ dbmsId: string, backupId: string }, string>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'downloadBackupText', data: args });
        return (await Dbms.getById(args.dbmsId)).downloadBackupText(args.backupId);
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
        const db = await new Db(args.dbId).getData();
        return (await Dbms.getById(db.dbms_id)).addUserToDb(args.userId, args.dbId, args.withoutChange);
      }),
      saveDbSchema: resolver<{ dbId: string, name: string }, DbSchemaTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'saveDbSchema', data: args });
        const db = await new Db(args.dbId).getData();
        return (await Dbms.getById(db.dbms_id)).saveSchema(args.dbId, args.name);
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
      uploadBackupText: resolver<{ dbmsId: string, backupText: string }, DbBackupTable>(async (parent, args, context, info) => {
        EventsObserver.listener({ type: 'uploadBackupText', data: args });
        return (await Dbms.getById(args.dbmsId)).uploadBackupText(args.backupText);
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