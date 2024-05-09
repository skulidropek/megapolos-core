import Knex from 'knex';
import BaseDbms from './BaseDbms';
import { DbSchemaSchema, DbSchemaSchemaTable, DbSchemaTable, DbTable, DbUserTable } from '../modules/models/tables';

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

  async createDbUserChange(user: Partial<DbUserTable>): Promise<boolean> {
    await (await this.getKnex('postgres')).raw(`CREATE USER IF NOT EXISTS ${user.name} WITH PASSWORD '${user.password}'`);
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
      const fields = await knex('information_schema.columns').select('column_name', 'data_type').where('table_name', table.name);
      for (let k2 in fields) {
        table.fields.push({
          name: fields[k2].column_name,
          type: fields[k2].data_type,
        });
      }
      result.tables.push(table);
    }
    return result;
  }
}

export default PostgresDmbs;