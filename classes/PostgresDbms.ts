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
  
  async getSchema(db: string): Promise<DbSchemaSchema> {
    const knex = await this.getKnex(db);
    const tables = await knex('information_schema.tables').select('table_name').where('table_schema', 'public');
    const result: DbSchemaSchema = {
      tables: [],
    };
    for (let k in tables) {
      const table:DbSchemaSchemaTable = {
        name: tables[k].table_name,
        fields: [],
      };
      const fields = await knex('information_schema.columns').select('column_name', 'data_type', 'udt_name').where('table_name', table.name);
      for (let k2 in fields) {
        table.fields.push({
          name: fields[k2].column_name,
          type: fields[k2].data_type === 'USER-DEFINED' ? fields[k2].udt_name : fields[k2].data_type,
        });
      }
      result.tables.push(table);
    }
    return result;
  }

  async backupProcess(db: Db, backup: DbBackup, artifact: Artifact): Promise<DbBackupTable> {
    const data = await this.getData();
    const dbData = await db.getData();
    if (data.host === 'localhost') {
      data.host = '172.17.0.1';
    }
    const file = await artifact.getPath() + '/backup.sql';
    await MegapolosNode.currentNode.shellCommand(`docker run -i --rm -e PGPASSWORD=${data.password} postgres pg_dump -c -h ${data.host} -U ${data.user} ${dbData.name} > ${file}`, new User('')).output;
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