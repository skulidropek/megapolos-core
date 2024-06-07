import Knex from 'knex';
import BaseDbms from './BaseDbms';
import { ArtifactTable, DbBackupTable, DbSchemaSchema, DbSchemaSchemaTable, DbSchemaTable, DbTable, DbUserTable } from '../modules/models/tables';
import Artifact from './Artifact';
import MegapolosNode from './Node';
import User from './User';
import Db from './Db';
import DbBackup from './DbBackup';
import { readFile, writeFile } from 'fs-extra';

class PostgresDmbs extends BaseDbms {
  async getKnex(db: string) {
    const data = await this.getData();
    return Knex({
      client: 'pg',
      connection: {
        user: data.user,
        host: data.host,
        password: data.password,              
        database: db,
      },
      pool: {
        min: 0,
        max: 10,
        acquireTimeoutMillis: 60000,
        idleTimeoutMillis: 600000,
      },
    });
  }

  async createDbChange(db: Partial<DbTable>): Promise<boolean> {
    const knex = await this.getKnex('postgres');
    const exists = await knex.raw(`SELECT 1 FROM pg_database WHERE datname = '${db.name}'`);
    if (!exists.rows.length) {
      await knex.raw(`CREATE DATABASE ${db.name}`);
    }
    return true;
  }

  async createUserChange(user: Partial<DbUserTable>): Promise<boolean> {
    const exists = await (await this.getKnex('postgres')).raw(`SELECT 1 FROM pg_roles WHERE rolname = '${user.name}'`);
    if (!exists.rows.length) {
      await (await this.getKnex('postgres')).raw(`CREATE USER ${user.name} LOGIN PASSWORD '${user.password}'`);
    }
    return true;
  }

  async addUserToDbChange(userName: string, dbName: string): Promise<boolean> {
    const knex = await this.getKnex('postgres');
    await knex.raw(`GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${userName}`);
    await knex.raw(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${userName}`);
    await knex.raw(`GRANT ALL PRIVILEGES ON SCHEMA public TO ${userName}`);
    await knex.raw(`ALTER DEFAULT PRIVILEGES FOR USER ${userName} IN SCHEMA public GRANT INSERT, UPDATE, DELETE, SELECT ON TABLES TO ${userName}`);
    return true;
  }

  /*
  SELECT table_name, column_name, is_nullable
  FROM information_schema.columns
  
  SELECT
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'

SELECT c.table_name, c.column_name, c.data_type, tc.constraint_type
FROM information_schema.table_constraints tc 
JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name) 
JOIN information_schema.columns AS c ON c.table_schema = tc.constraint_schema
  AND tc.table_name = c.table_name AND ccu.column_name = c.column_name
WHERE (tc.constraint_type = 'PRIMARY KEY' OR tc.constraint_type = 'UNIQUE') AND tc.table_schema = 'public'
  */
  
  async getSchema(db: string): Promise<DbSchemaSchema> {
    const knex = await this.getKnex(db);
    const tables = await knex('information_schema.tables').select('table_name').where('table_schema', 'public');
    const foreignKeys = await knex.raw(`
    WITH unnested_confkey AS (
      SELECT oid, unnest(confkey) as confkey
      FROM pg_constraint
    ),
    unnested_conkey AS (
      SELECT oid, unnest(conkey) as conkey
      FROM pg_constraint
    )
    select
      c.conname                   AS constraint_name,
      c.contype                   AS constraint_type,
      tbl.relname                 AS constraint_table,
      col.attname                 AS constraint_column,
      referenced_tbl.relname      AS referenced_table,
      referenced_field.attname    AS referenced_column,
      pg_get_constraintdef(c.oid) AS definition
    FROM pg_constraint c
    LEFT JOIN unnested_conkey con ON c.oid = con.oid
    LEFT JOIN pg_class tbl ON tbl.oid = c.conrelid
    LEFT JOIN pg_attribute col ON (col.attrelid = tbl.oid AND col.attnum = con.conkey)
    LEFT JOIN pg_class referenced_tbl ON c.confrelid = referenced_tbl.oid
    LEFT JOIN unnested_confkey conf ON c.oid = conf.oid
    LEFT JOIN pg_attribute referenced_field ON (referenced_field.attrelid = c.confrelid AND referenced_field.attnum = conf.confkey)
    WHERE c.contype = 'f'
    ORDER BY constraint_table
    `);
    const contraints = await knex.raw(`
  SELECT DISTINCT c.table_name, c.column_name, c.data_type, tc.constraint_type
  FROM information_schema.table_constraints tc 
  JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name) 
  JOIN information_schema.columns AS c ON c.table_schema = tc.constraint_schema
    AND tc.table_name = c.table_name AND ccu.column_name = c.column_name
  WHERE (tc.constraint_type = 'PRIMARY KEY' OR tc.constraint_type = 'UNIQUE') AND tc.table_schema = 'public'
    `);

    const result: DbSchemaSchema = {
      tables: [],
    };
    for (let k in tables) {
      const table:DbSchemaSchemaTable = {
        name: tables[k].table_name,
        fields: [],
        foreignKeys: [],
      };
      const fields = await knex('information_schema.columns')
        .select('column_name', 'data_type', knex.raw('udt_name::regtype'), 'is_nullable')
        .where('table_name', table.name);
      fields.forEach((field: any) => {
        table.fields.push({
          name: field.column_name,
          type: field.data_type === 'USER-DEFINED' || field.data_type === 'ARRAY' ? field.udt_name : field.data_type,
          notNull: field.is_nullable === 'NO',
          unique: contraints.rows.find((row: any) => 
            row.table_name === table.name && row.column_name === field.column_name && 
          row.constraint_type === 'UNIQUE',
          ) !== undefined,
          primaryKey: contraints.rows.find((row: any) => 
            row.table_name === table.name && row.column_name === field.column_name &&
          row.constraint_type === 'PRIMARY KEY',
          ) !== undefined,
        });
      });
      table.foreignKeys = 
        foreignKeys.rows.filter((row: any) => row.constraint_table === table.name).map((row: any) => ({
          name: row.constraint_name,
          field: row.constraint_column,
          foreignTable: row.referenced_table,
          foreignField: row.referenced_column,
        }));
      result.tables.push(table);
    }
    return result;
  }

  async backupProcess(db: Db, backup: DbBackup, artifact: Artifact, withoutData: boolean): Promise<DbBackupTable> {
    const data = await this.getData();
    const dbData = await db.getData();
    if (data.host === 'localhost') {
      data.host = '172.17.0.1';
    }
    const file = await artifact.getPath() + '/backup.sql';
    await MegapolosNode.currentNode.shellCommand(`docker run -i --rm -e PGPASSWORD=${data.password} postgres pg_dump -c -h ${data.host} -U ${data.user} ${withoutData ? '-s' : ''} ${dbData.name} > ${file}`, new User('')).output;
    return backup.getData();
  }

  async restoreProcess(db: Db, backup: DbBackup, artifact: Artifact): Promise<boolean> {
    const data = await this.getData();
    const dbData = await db.getData();
    if (data.host === 'localhost') {
      data.host = '172.17.0.1';
    }
    const file = await artifact.getPath() + '/backup.sql';
    await MegapolosNode.currentNode.shellCommand(`cat ${file} | docker run --rm -i -e PGPASSWORD=${data.password} postgres psql -h ${data.host} --echo-errors -U ${data.user} ${dbData.name}`, new User('')).output;
    return true;
  }

  async downloadBackupTextProcess(backup: DbBackup, artifact: Artifact): Promise<string> {
    const file = await artifact.getPath() + '/backup.sql';
    return readFile(file, 'utf8');
  }

  async uploadBackupTextProcess(text: string, backup: DbBackup, artifact: Artifact): Promise<DbBackupTable> {
    const file = await artifact.getPath() + '/backup.sql';
    await writeFile(file, text);
    return backup.getData();
  }

  async getInternalDbs(): Promise<string[]> {
    return (await (await this.getKnex('postgres'))
      .select('datname').from('pg_database').whereRaw('datistemplate = false'))
      .map((row: any) => row.datname);
  }

  async getInternalUsers(): Promise<string[]> {
    return (await (await this.getKnex('postgres'))
      .select('rolname').from('pg_roles').whereRaw('rolname NOT LIKE \'pg_%\''))
      .map((row: any) => row.rolname);
  }
}

export default PostgresDmbs;