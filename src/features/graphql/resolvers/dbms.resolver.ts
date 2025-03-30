/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../../events/eventsObserver';
import { resolver } from '../../../domain/types';
import { DbBackupTable, DbSchemaSchema, DbSchemaTable, DbTable, DbUserTable, DbmsTable } from '../../db/tables';
import BaseDbms from '../../repository/dbms/BaseDbms';
import Dbms from '../../repository/dbms/Dbms';
import DbUser from '../../repository/db/DbUser';
import Db from '../../repository/db/Db';
import DbBackup from '../../repository/db/DbBackup';
import DbSchema from '../../repository/db/DbSchema';

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
        getDbUsers: [DbUser]
        getDbUser(id: String!): DbUser
        getDbBackups: [DbBackup]
        getDbBackup(id: String!): DbBackup
        getDbSchemas: [DbSchema]
        getDbSchema(id: String!): DbSchema
        compareDbs(dbId1: String! dbId2: String!): [String]
        compareSchemas(schema1id: String! schema2id: String!): [String]
        compareDbSchema(dbid: String! schemaid: String!): [String]
        downloadBackupText(backupId: String!): String
      }
      type Mutation {
        createDbms(dbms: DbmsInput): Dbms
        removeDbms(id: String!): Boolean
        editDbms(id: String! dbms: DbmsInput): Dbms
        createDb(db: DbInput! withoutChange: Boolean): Db
        createDbUser(user: DbUserInput! withoutChange: Boolean): DbUser
        addDbUserToDb(userId: String! dbId: String! withoutChange: Boolean): Boolean
        restoreDbUsers(dbId: String!): Boolean
        saveDbSchema(dbId: String! name: String): DbSchema
        backupDb(dbId: String! name: String withoutData: Boolean): DbBackup
        restoreDb(dbId: String! backupId: String!): Boolean
        cloneDb(fromDbId: String! toDbId: String! fromDbUserId: String): Boolean
        massDbQuery(dbmsId: String! dbNames: [String]! query: String!): [massDbQueryResult]
        uploadBackupText(type: String! backupText: String!): DbBackup
      }
      type massDbQueryResult {
        dbName: String
        result: String
        error: String
      }
      type DbSchemaSchemaField {
        name: String
        type: String
        notNull: Boolean
        unique: Boolean
        primaryKey: Boolean
      }
      type DbSchemaSchemaForeignKey {
        name: String
        field: String
        foreignTable: String
        foreignField: String
      }
      type DbSchemaSchemaTable {
        name: String
        fields: [DbSchemaSchemaField]
        foreignKeys: [DbSchemaSchemaForeignKey]
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
            internalDbs: [String]
            internalUsers: [String]
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
            dbms_id: String
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
            password: String
            dbms_id: String
            dbms: Dbms
            create_date: DateTime
            update_date: DateTime
            dbs: [Db]
        }

        input DbUserInput {
            name: String
            dbms_id: String
            password: String
        }
    `,
  ],
  resolvers: {
    Query: {
      getDbmss: resolver<{}, DbmsTable[]>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'getDbmss', data: args });
        return new BaseDbms(context).getAll();
      }),
      getDbms: resolver<{ id: string }, DbmsTable>(async (parent, args) => {
        EventsObserver.listener({ type: 'getDbms', data: args });
        return (await Dbms.getById(args.id)).getData();
      }),
      getDbs: resolver<{}, DbTable[]>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'getDbs', data: args });
        return new Db(context).getAll();
      }),
      getDb: resolver<{ id: string }, DbTable>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'getDb', data: args });
        return new Db(context, args.id).getData();
      }),
      getDbUsers: resolver<{}, DbUserTable[]>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'getDbUsers', data: args });
        return new DbUser(context).getAll();
      }),
      getDbUser: resolver<{ id: string }, DbUserTable>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'getDbUser', data: args });
        return new DbUser(context, args.id).getData();
      }),
      getDbBackups: resolver<{}, DbBackupTable[]>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'getDbBackups', data: args });
        return new DbBackup(context).getAll();
      }),
      getDbBackup: resolver<{ id: string }, DbBackupTable>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'getDbBackup', data: args });
        return new DbBackup(context, args.id).getData();
      }),
      getDbSchemas: resolver<{}, DbSchemaTable[]>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'getDbSchemas', data: args });
        return new DbSchema(context).getAll();
      }),
      getDbSchema: resolver<{ id: string }, DbSchemaTable>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'getDbSchema', data: args });
        return new DbSchema(context, args.id).getData();
      }),
      compareDbs: resolver<{ dbId1: string, dbId2: string }, string[]>(async (parent, args) => {
        EventsObserver.listener({ type: 'compareDbs', data: args });
        return Dbms.compareDbs(args.dbId1, args.dbId2);
      }),
      compareSchemas: resolver<{ schema1id: string, schema2id: string }, string[]>(async (parent, args) => {
        EventsObserver.listener({ type: 'compareSchemas', data: args });
        return Dbms.compareSchemas(args.schema1id, args.schema2id);
      }),
      compareDbSchema: resolver<{ dbid: string, schemaid: string }, string[]>(async (parent, args) => {
        EventsObserver.listener({ type: 'compareDbSchema', data: args });
        return Dbms.compareDbSchema(args.dbid, args.schemaid);
      }),
      downloadBackupText: resolver<{ backupId: string }, string>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'downloadBackupText', data: args });
        const dbBackup = await new DbBackup(context, args.backupId).getData();
        return (await Dbms.getByType(dbBackup.type)).downloadBackupText(args.backupId);
      }),
    },
    Mutation: {
      createDbms: resolver<{ dbms: Partial<DbmsTable> }, DbmsTable>(async (parent, args) => {
        EventsObserver.listener({ type: 'createDbms', data: args });
        return (await Dbms.getByType(args.dbms.type)).create(args.dbms);
      }),
      editDbms: resolver<{ id: string, dbms: Partial<DbmsTable> }, DbmsTable>(async (parent, args) => {
        EventsObserver.listener({ type: 'editDbms', data: args });
        return (await Dbms.getById(args.id)).edit(args.dbms);
      }),
      removeDbms: resolver<{ id: string }, boolean>(async (parent, args) => {
        EventsObserver.listener({ type: 'removeDbms', data: args });
        await (await Dbms.getById(args.id)).delete();
        return true;
      }),
      createDb: resolver<{ db: Partial<DbTable>, withoutChange: boolean }, DbTable>(async (parent, args) => {
        EventsObserver.listener({ type: 'createDb', data: args });
        return (await Dbms.getById(args.db.dbms_id)).createDb(args.db, args.withoutChange);
      }),
      createDbUser: resolver<{ user: Partial<DbUserTable>, withoutChange: boolean }, DbUserTable>(async (parent, args) => {
        EventsObserver.listener({ type: 'createDbUser', data: args });
        return (await Dbms.getById(args.user.dbms_id)).createUser(args.user, args.withoutChange);
      }),
      addDbUserToDb: resolver<{ userId: string, dbId: string, withoutChange: boolean }, boolean>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'addDbUserToDb', data: args });
        const db = await new Db(context, args.dbId).getData();
        return (await Dbms.getById(db.dbms_id)).addUserToDb(args.userId, args.dbId, args.withoutChange);
      }),
      restoreDbUsers: resolver<{ dbId: string }, boolean>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'restoreDbUsers', data: args });
        const db = await new Db(context, args.dbId).getData();
        return (await Dbms.getById(db.dbms_id)).restoreDbPrivileges(db.id);
      }),
      saveDbSchema: resolver<{ dbId: string, name: string }, DbSchemaTable>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'saveDbSchema', data: args });
        const db = await new Db(context, args.dbId).getData();
        return (await Dbms.getById(db.dbms_id)).saveSchema(args.dbId, args.name);
      }),
      backupDb: resolver<{ dbId: string, name: string, withoutData: boolean }, DbBackupTable>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'backupDb', data: args });
        const db = await new Db(context, args.dbId).getData();
        const dbms = await Dbms.getById(db.dbms_id);
        return dbms.backup(db.id, args.name, args.withoutData);
      }),
      restoreDb: resolver<{ dbId: string, backupId: string }, boolean>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'restoreDb', data: args });
        const db = await new Db(context, args.dbId).getData();
        const dbms = await Dbms.getById(db.dbms_id);
        return dbms.restore(db.id, args.backupId);
      }),
      cloneDb: resolver<{ fromDbId: string, toDbId: string, fromDbUserId: string }, boolean>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'cloneDb', data: args });
        const fromDb = await new Db(context, args.fromDbId).getData();
        const toDb = await new Db(context, args.toDbId).getData();
        return (await Dbms.getById(fromDb.dbms_id)).cloneDb(fromDb.id, toDb.id, args.fromDbUserId);
      }),
      massDbQuery: resolver<{ dbmsId: string, dbNames: string[], query: string }, { dbName: string, result: string, error: string }[]>(async (parent, args) => {
        EventsObserver.listener({ type: 'massDbQuery', data: args });
        return (await Dbms.getById(args.dbmsId)).massDbQuery(args.dbNames, args.query);
      }),
      uploadBackupText: resolver<{ type: string, backupText: string }, DbBackupTable>(async (parent, args) => {
        EventsObserver.listener({ type: 'uploadBackupText', data: args });
        return (await Dbms.getByType(args.type)).uploadBackupText(args.backupText, args.type);
      }),
    },
    Dbms: {
      dbs: resolver<DbmsTable, DbTable[]>(async (parent, args) => {
        EventsObserver.listener({ type: 'Dbms.dbs', data: args });
        return (await Dbms.getById(parent.id)).getDbs();
      }),
      internalDbs: resolver<DbmsTable, string[]>(async (parent, args) => {
        EventsObserver.listener({ type: 'Dbms.internalDbs', data: args });
        return (await Dbms.getById(parent.id)).getInternalDbs();
      }),
      users: resolver<DbmsTable, DbUserTable[]>(async (parent, args) => {
        EventsObserver.listener({ type: 'Dbms.users', data: args });
        return (await Dbms.getById(parent.id)).getUsers();
      }),
      internalUsers: resolver<DbmsTable, string[]>(async (parent, args) => {
        EventsObserver.listener({ type: 'Dbms.internalUsers', data: args });
        return (await Dbms.getById(parent.id)).getInternalUsers();
      }),
    },
    Db: {
      dbms: resolver<DbTable, DbmsTable>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'Db.dbms', data: args });
        return new Db(context, parent.id).getDbms();
      }),
      users: resolver<DbTable, DbUserTable[]>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'Db.users', data: args });
        return new Db(context, parent.id).getUsers();
      }),
      schema: resolver<DbTable, DbSchemaSchema>(async (parent, args) => {
        EventsObserver.listener({ type: 'Db.schema', data: args });
        return (await Dbms.getById(parent.dbms_id)).getSchema(parent.name);
      }),
    },
    DbUser: {
      dbms: resolver<DbUserTable, DbmsTable>(async (parent, args) => {
        EventsObserver.listener({ type: 'DbUser.dbms', data: args });
        return new DbUser(parent.id).getDbms();
      }),
      dbs: resolver<DbUserTable, DbTable[]>(async (parent, args) => {
        EventsObserver.listener({ type: 'DbUser.dbs', data: args });
        return new DbUser(parent.id).getDbs();
      }),
    },
  },
});

export default dbmsModule;