import { knex } from '../corePostgres';
import { ArtifactTable, DbBackupTable, DbSchemaSchema, DbSchemaTable, DbTable, DbUserTable, DbmsTable } from '../modules/models/tables';
import Artifact from './Artifact';
import BaseRepository from './BaseRepository';
import Db from './Db';
import DbBackup from './DbBackup';
import DbSchema from './DbSchema';
import DbUser from './DbUser';
import PostgresDmbs from './PostgresDbms';

class BaseDbms extends BaseRepository<DbmsTable> {
  getTable(): string {
    return 'dbms';
  }

  async createDb(db: Partial<DbTable>, withoutChange: boolean = false): Promise<DbTable> {
    const result = await new Db().create({ ...db, dbms_id: this.id });
    if (!withoutChange) {
      await this.createDbChange(db);
    }
    return result;
  }

  async createUser(user: Partial<DbUserTable>, withoutChange: boolean = false): Promise<DbUserTable> {
    const result = await new DbUser().create({ ...user, dbms_id: this.id });
    if (!withoutChange) {
      await this.createUserChange(user);
    }
    return result;
  }

  async addUserToDb(userId: string, dbId: string, withoutChange: boolean = false): Promise<boolean> {
    await knex.insert({
      db_id: dbId,
      db_user_id: userId,
    }).into('db_db_user');
    if (!withoutChange) {
      const user = await new DbUser(userId).getData();
      const db = await new Db(dbId).getData();
      await this.addUserToDbChange(user.name, db.name);
    }
    return true;
  }

  async createDbChange(db: Partial<DbTable>): Promise<boolean> {
    return true;
  }

  async createUserChange(user: Partial<DbUserTable>): Promise<boolean> {
    return true;
  }

  async addUserToDbChange(userName: string, dbName: string): Promise<boolean> {
    return true;
  }

  async getDbs(): Promise<DbTable[]> {
    return new Db().getByFields({ dbms_id: this.id });
  }

  async getUsers(): Promise<DbUserTable[]> {
    return new DbUser().getByFields({ dbms_id: this.id });
  }

  async backup(dbId: string): Promise<DbBackupTable> {
    const data = await this.getData();
    const artifact = new Artifact();
    await artifact.create({
      name: 'backup',
      type: 'backup',
    });
    const backup = new DbBackup();
    await backup.create({
      name: 'backup',
      artifact_id: artifact.id,
      type: data.type,
    });
    const db = new Db(dbId);
    return this.backupProcess(db, backup, artifact);
  }

  async backupProcess(db: Db, backup: DbBackup, artifact: Artifact): Promise<DbBackupTable> {
    return new DbBackup().getData();
  }

  async restore(dbId: string, backupId: string): Promise<boolean> {
    const db = new Db(dbId);
    const backup = new DbBackup(backupId);
    const artifact = await backup.getArtifact();
    return this.restoreProcess(db, backup, artifact);
  }

  async restoreProcess(db: Db, backup: DbBackup, artifact: Artifact): Promise<boolean> {
    return true;
  }

  async downloadBackupText(backupId: string): Promise<string> {
    const backup = new DbBackup(backupId);
    const artifact = await backup.getArtifact();
    return this.downloadBackupTextProcess(backup, artifact);
  }

  async downloadBackupTextProcess(backup: DbBackup, artifact: Artifact): Promise<string> {
    return '';
  }

  async uploadBackupText(text: string): Promise<DbBackupTable> {
    const data = await this.getData();
    const artifact = new Artifact();
    await artifact.create({
      name: 'backup',
      type: 'backup',
    });
    const backup = new DbBackup();
    await backup.create({
      name: 'backup',
      artifact_id: artifact.id,
      type: data.type,
    });
    return this.uploadBackupTextProcess(text, backup, artifact);
  }

  async uploadBackupTextProcess(text: string, backup: DbBackup, artifact: Artifact): Promise<DbBackupTable> {
    return backup.getData();
  }

  async getSchema(db: string): Promise<DbSchemaSchema> {
    return {
      tables: [],
    };
  }

  async saveSchema(dbId: string, name: string): Promise<DbSchemaTable> {
    const db = await new Db(dbId).getData();
    const schema = await this.getSchema(db.name);
    return new DbSchema().create({
      schema,
      name,
    });
  }    
}

export default BaseDbms;