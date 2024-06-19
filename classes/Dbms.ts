import { knex } from '../corePostgres';
import { DbSchemaSchema, DbmsTable } from '../modules/models/tables';
import BaseDbms from './BaseDbms';
import Db from './Db';
import DbSchema from './DbSchema';
import PostgresDmbs from './PostgresDbms';

class Dbms {
  static async getById(id: string):Promise<BaseDbms> {
    const dbms: DbmsTable = await knex.select().from('dbms').where('id', id).first();
    if (dbms?.type === 'postgres') {
      return new PostgresDmbs(dbms);
    }
    throw new Error('Dbms type not found');
  }

  static async getByType(type: string):Promise<BaseDbms> {
    if (type === 'postgres') {
      return new PostgresDmbs();
    }
    throw new Error('Dbms type not found');
  }

  static async compareDbs(db1id: string, db2id: string): Promise<string[]> {
    const db1 = await new Db(db1id).getData();
    const db2 = await new Db(db2id).getData();
    const dbms1 = await this.getById(db1.dbms_id);
    const dbms2 = await this.getById(db2.dbms_id);
    const schema1 = await dbms1.getSchema(db1.name);
    const schema2 = await dbms2.getSchema(db2.name);
    return this.compareSchemaSchemas(schema1, schema2);
  }

  static async compareSchemas(schema1id: string, schema2id: string): Promise<string[]> {
    const schema1 = await new DbSchema(schema1id).getData();
    const schema2 = await new DbSchema(schema2id).getData();
    return this.compareSchemaSchemas(schema1.schema, schema2.schema);
  }

  static async compareDbSchema(dbid: string, schemaid: string): Promise<string[]> {
    const db = await new Db(dbid).getData();
    const dbms = await this.getById(db.dbms_id);
    const schema1 = await dbms.getSchema(db.name);
    const schema2 = await new DbSchema(schemaid).getData();
    return this.compareSchemaSchemas(schema1, schema2.schema);
  }

  static async compareSchemaSchemas(schema1: DbSchemaSchema, schema2: DbSchemaSchema): Promise<string[]> {
    const result: string[] = ['', ''];
    schema1.tables.forEach((table1) => {
      const table2 = schema2.tables.find((table) => table.name === table1.name);
      if (!table2) {
        result[0] += `Table ${table1.name}\n`;
        result[1] += '\n';
      } else {
        table1.fields.forEach((field1) => {
          const field2 = table2.fields.find((field) => field.name === field1.name);
          if (!field2) {
            result[0] += `Field ${table1.name}.${field1.name}\n`;
            result[1] += '\n';
          } else if (field1.type !== field2.type) {
            result[0] += `Field ${table1.name}.${field1.name} type ${field1.type}\n`;
            result[1] += `Field ${table2.name}.${field2.name} type ${field2.type}\n`;
          } else if (field1.notNull !== field2.notNull) {
            result[0] += `Field ${table1.name}.${field1.name} notNull ${field1.notNull}\n`;
            result[1] += `Field ${table2.name}.${field2.name} notNull ${field2.notNull}\n`;
          } else if (field1.unique !== field2.unique) {
            result[0] += `Field ${table1.name}.${field1.name} unique ${field1.unique}\n`;
            result[1] += `Field ${table2.name}.${field2.name} unique ${field2.unique}\n`;
          } else if (field1.primaryKey !== field2.primaryKey) {
            result[0] += `Field ${table1.name}.${field1.name} primaryKey ${field1.primaryKey}\n`;
            result[1] += `Field ${table2.name}.${field2.name} primaryKey ${field2.primaryKey}\n`;
          }
        });
        table2.fields.forEach((field2) => {
          const field1 = table1.fields.find((field) => field.name === field2.name);
          if (!field1) {
            result[0] += '\n';
            result[1] += `Field ${table2.name}.${field2.name}\n`;
          }
        });
        table1.foreignKeys.forEach((foreignKey1) => {
          const foreignKey2 = table2.foreignKeys.find((foreignKey) => foreignKey.name === foreignKey1.name);
          if (!foreignKey2) {
            result[0] += `ForeignKey ${table1.name}.${foreignKey1.name}\n`;
            result[1] += '\n';
          } else if (foreignKey1.field !== foreignKey2.field) {
            result[0] += `ForeignKey ${table1.name}.${foreignKey1.name} field ${foreignKey1.field}\n`;
            result[1] += `ForeignKey ${table2.name}.${foreignKey2.name} field ${foreignKey2.field}\n`;
          } else if (foreignKey1.foreignTable !== foreignKey2.foreignTable) {
            result[0] += `ForeignKey ${table1.name}.${foreignKey1.name} foreignTable ${foreignKey1.foreignTable}\n`;
            result[1] += `ForeignKey ${table2.name}.${foreignKey2.name} foreignTable ${foreignKey2.foreignTable}\n`;
          } else if (foreignKey1.foreignField !== foreignKey2.foreignField) {
            result[0] += `ForeignKey ${table1.name}.${foreignKey1.name} foreignField ${foreignKey1.foreignField}\n`;
            result[1] += `ForeignKey ${table2.name}.${foreignKey2.name} foreignField ${foreignKey2.foreignField}\n`;
          }
        });
        table2.foreignKeys.forEach((foreignKey2) => {
          const foreignKey1 = table1.foreignKeys.find((foreignKey) => foreignKey.name === foreignKey2.name);
          if (!foreignKey1) {
            result[0] += '\n';
            result[1] += `ForeignKey ${table2.name}.${foreignKey2.name}\n`;
          }
        });
      }
    });
    schema2.tables.forEach((table2) => {
      const table1 = schema1.tables.find((table) => table.name === table2.name);
      if (!table1) {
        result[0] += '\n';
        result[1] += `Table ${table2.name}\n`;
      }
    });
    return result;
  }
}

export default Dbms;