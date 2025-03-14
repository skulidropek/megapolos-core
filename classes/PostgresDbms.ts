import Knex from 'knex';
import BaseDbms from './BaseDbms';
import { ArtifactTable, DbBackupTable, DbSchemaSchema, DbSchemaSchemaTable, DbSchemaTable, DbTable, DbUserTable, LogType } from '../modules/models/tables';
import Artifact from './Artifact';
import MegapolosNode from './Node';
import User from './User';
import Db from './Db';
import DbBackup from './DbBackup';
import { readFile, writeFile } from 'fs-extra';
import Log from './Log';

class PostgresDmbs extends BaseDbms {
  async getKnex(db: string) {
    if (!db) {
      throw new Error('Database name is empty');
    }
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
    const exists = await knex.raw('SELECT 1 FROM pg_database WHERE datname = ?', [db.name]);
    if (!exists.rows.length) {
      await knex.raw('CREATE DATABASE ?', [db.name]);
    }
    return true;
  }

  async truncateDbChange(dbName: string): Promise<boolean> {
    const knex = await this.getKnex(dbName);
    await knex.raw(`DROP SCHEMA public CASCADE`);
    await knex.raw(`CREATE SCHEMA public`);
    return true;
  }

  async createUserChange(user: Partial<DbUserTable>): Promise<boolean> {
    const exists = await (await this.getKnex('postgres')).raw(
      'SELECT 1 FROM pg_roles WHERE rolname = ', [user.name]);
    if (!exists.rows.length) {
      await (await this.getKnex('postgres')).raw('CREATE USER ? LOGIN PASSWORD ?', [user.name, user.password]);
    } else {
      await (await this.getKnex('postgres')).raw('ALTER USER ? WITH PASSWORD ?', [user.name, user.password]);
    }
    return true;
  }

  async addUserToDbChange(userName: string, dbName: string): Promise<boolean> {
    const knex = await this.getKnex(dbName);
    await knex.raw('GRANT ALL PRIVILEGES ON DATABASE ? TO ?', [dbName, userName]);
    await knex.raw('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ?', [userName]);
    await knex.raw('GRANT ALL PRIVILEGES ON SCHEMA public TO ?', [userName]);
    await knex.raw(`ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT ALL PRIVILEGES ON TABLES TO ?`, [userName]);
    await knex.raw(`ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT ALL PRIVILEGES ON SEQUENCES TO ?`, [userName]);
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
    const backupData = await backup.getData();
    const log = new Log();
    await log.create({ 
      name: 'Backup postgrsql db ' + data.name + '.' + dbData.name + ' to backup ' + backupData.name,
      type: LogType.DbBackup,
      object_id: backupData.id,
      object_name: backupData.name,
    });
    await MegapolosNode.currentNode.shellCommand(`docker run -i --rm -e PGPASSWORD=${data.password} postgres pg_dump -c -h ${data.host} -U ${data.user} ${withoutData ? '-s' : ''} --if-exists --no-owner --no-privileges ${dbData.name} > ${file}`, new User(''), log).output;
    return backup.getData();
  }

  async restoreProcess(db: Db, backup: DbBackup, artifact: Artifact): Promise<boolean> {
    const data = await this.getData();
    const dbData = await db.getData();
    if (data.host === 'localhost') {
      data.host = '172.17.0.1';
    }
    const file = await artifact.getPath() + '/backup.sql';
    const backupData = await backup.getData();
    const log = new Log();
    await log.create({ 
      name: 'Restore postgrsql db ' + data.name + '.' + dbData.name + ' from backup ' + backupData.name,
      type: LogType.DbBackup,
      object_id: backupData.id,
      object_name: backupData.name,
    });
    await MegapolosNode.currentNode.shellCommand(`cat ${file} | docker run --rm -i -e PGPASSWORD=${data.password} postgres psql -h ${data.host} --echo-errors -U ${data.user} ${dbData.name}`, new User(''), log).output;
    return true;
  }

  async setOwnerChange(dbName: string, userName: string): Promise<boolean> {
    const db = await this.getKnex(dbName);
    await db.raw(`
      DO $$DECLARE r record;
DECLARE
    v_schema varchar := 'public';
    v_new_owner varchar := '${userName}';
BEGIN
    FOR r IN 
        select 'ALTER TABLE "' || table_schema || '"."' || table_name || '" OWNER TO ' || v_new_owner || ';' as a from information_schema.tables where table_schema = v_schema
        union all
        select 'ALTER TABLE "' || sequence_schema || '"."' || sequence_name || '" OWNER TO ' || v_new_owner || ';' as a from information_schema.sequences where sequence_schema = v_schema
        union all
        select 'ALTER TABLE "' || table_schema || '"."' || table_name || '" OWNER TO ' || v_new_owner || ';' as a from information_schema.views where table_schema = v_schema
        union all
        select 'ALTER FUNCTION "'||nsp.nspname||'"."'||p.proname||'"('||pg_get_function_identity_arguments(p.oid)||') OWNER TO ' || v_new_owner || ';' as a from pg_proc p join pg_namespace nsp ON p.pronamespace = nsp.oid where nsp.nspname = v_schema
    LOOP
        EXECUTE r.a;
    END LOOP;
END$$;
      `);
    return true;
  }

  async massDbQueryChange(dbNames: string[], query: string): Promise<{ dbName: string; result: string; error: string; }[]> {
    const results: { dbName: string; result: string; error: string; }[] = [];
    for (let i in dbNames) {
      const result: { dbName: string; result: string; error: string; } = {
        dbName: dbNames[i],
        result: '',
        error: '',
      };
      const dbName = dbNames[i];
      const knex = await this.getKnex(dbName);
      try {
        result.result = JSON.stringify((await knex.raw(query)));
      } catch (e) {
        result.error = e.message;
      }
      results.push(result);
    }
    return results;
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