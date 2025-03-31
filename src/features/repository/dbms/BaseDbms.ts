import moment from 'moment';
import { knex } from '../../db/knex';
import {
  DbBackupTable,
  DbSchemaSchema,
  DbSchemaTable,
  DbTable,
  DbUserTable,
  DbmsTable,
} from '../../db/tables';
import Artifact from '../Artifact';
import BaseRepository from '../BaseRepository';
import Db from '../db/Db';
import DbSchema from '../db/DbSchema';
import DbUser from '../db/DbUser';
import DbBackup from '../db/DbBackup';

class BaseDbms extends BaseRepository<DbmsTable> {
  getTable(): string {
    return 'dbms';
  }

  async createDb(
    db: Partial<DbTable>,
    withoutChange: boolean = false
  ): Promise<DbTable> {
    const result = await new Db(this.ctx).create({ ...db, dbms_id: this.id });
    if (!withoutChange) {
      await this.createDbChange(db);
    }
    return result;
  }

  async createUser(
    user: Partial<DbUserTable>,
    withoutChange: boolean = false
  ): Promise<DbUserTable> {
    const result = await new DbUser(this.ctx).create({
      ...user,
      dbms_id: this.id,
    });
    if (!withoutChange) {
      await this.createUserChange(user);
    }
    return result;
  }

  async addUserToDb(
    userId: string,
    dbId: string,
    withoutChange: boolean = false
  ): Promise<boolean> {
    await knex
      .insert({
        db_id: dbId,
        db_user_id: userId,
      })
      .into('db_db_user');
    if (!withoutChange) {
      const user = await new DbUser(this.ctx, userId).getData();
      const db = await new Db(this.ctx, dbId).getData();
      await this.addUserToDbChange(user.name, db.name);
    }
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createDbChange(db: Partial<DbTable>): Promise<boolean> {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async truncateDbChange(dbName: string): Promise<boolean> {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createUserChange(user: Partial<DbUserTable>): Promise<boolean> {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async addUserToDbChange(userName: string, dbName: string): Promise<boolean> {
    return true;
  }

  async getDbs(): Promise<DbTable[]> {
    return new Db(this.ctx).getByFields({ dbms_id: this.id });
  }

  async getUsers(): Promise<DbUserTable[]> {
    return new DbUser(this.ctx).getByFields({ dbms_id: this.id });
  }

  async getInternalDbs(): Promise<string[]> {
    return [];
  }

  async getInternalUsers(): Promise<string[]> {
    return [];
  }

  async backup(
    dbId: string,
    name: string,
    withoutData: boolean
  ): Promise<DbBackupTable> {
    const data = await this.getData();
    const artifact = new Artifact(this.ctx);
    const db = new Db(this.ctx, dbId);
    const dbData = await db.getData();
    if (!name) {
      name =
        data.name +
        ' ' +
        dbData.name +
        ' ' +
        moment().format('YYYY-MM-DD HH:mm:ss');
    }
    await artifact.create({
      name: 'Db backup ' + name,
      type: 'backup',
    });
    const backup = new DbBackup(this.ctx);
    await backup.create({
      name: name,
      artifact_id: artifact.id,
      type: data.type,
    });
    return this.backupProcess(db, backup, artifact, withoutData);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async backupProcess(
    db: Db,
    backup: DbBackup,
    artifact: Artifact,
    withoutData: boolean
  ): Promise<DbBackupTable> {
    return new DbBackup(this.ctx).getData();
  }

  async restore(dbId: string, backupId: string): Promise<boolean> {
    const db = new Db(this.ctx, dbId);
    const backup = new DbBackup(this.ctx, backupId);
    const artifact = await backup.getArtifact();
    await this.truncateDbChange((await db.getData()).name);
    const result = await this.restoreProcess(db, backup, artifact);
    await this.restoreDbPrivileges(dbId);
    return result;
  }

  async cloneDb(
    fromDbId: string,
    toDbId: string,
    fromDbUserId?: string
  ): Promise<boolean> {
    const fromDb = await new Db(this.ctx, fromDbId).getData();
    const toDb = await new Db(this.ctx, toDbId).getData();
    const backupFrom = await this.backup(
      fromDbId,
      `Clone ${fromDb.name} to ${toDb.name}, backup ${fromDb.name}`,
      false
    );
    await this.backup(
      toDbId,
      `Clone ${fromDb.name} to ${toDb.name}, backup ${toDb.name}`,
      false
    );
    await this.restore(toDbId, backupFrom.id);
    if (fromDbUserId) {
      await this.setOwner(toDbId, fromDbUserId);
    }
    return true;
  }

  async restoreDbPrivileges(dbId: string): Promise<boolean> {
    const db = await new Db(this.ctx, dbId);
    const dbData = await db.getData();
    const users = await db.getUsers();
    for (let i in users) {
      const user = users[i];
      await this.addUserToDbChange(user.name, dbData.name);
    }
    return true;
  }

  async setOwner(dbId: string, userId: string): Promise<boolean> {
    const db = new Db(this.ctx, dbId);
    const user = new DbUser(this.ctx, userId);
    const dbData = await db.getData();
    const userData = await user.getData();
    return this.setOwnerChange(dbData.name, userData.name);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setOwnerChange(dbName: string, userName: string): Promise<boolean> {
    return true;
  }

  async massDbQuery(
    dbNames: string[],
    query: string
  ): Promise<
    {
      dbName: string;
      result: string;
      error: string;
    }[]
  > {
    return this.massDbQueryChange(dbNames, query);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async massDbQueryChange(
    dbNames: string[],
    query: string
  ): Promise<
    {
      dbName: string;
      result: string;
      error: string;
    }[]
  > {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async restoreProcess(
    db: Db,
    backup: DbBackup,
    artifact: Artifact
  ): Promise<boolean> {
    return true;
  }

  async downloadBackupText(backupId: string): Promise<string> {
    const backup = new DbBackup(this.ctx, backupId);
    const artifact = await backup.getArtifact();
    return this.downloadBackupTextProcess(backup, artifact);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async downloadBackupTextProcess(
    backup: DbBackup,
    artifact: Artifact
  ): Promise<string> {
    return '';
  }

  async uploadBackupText(text: string, type: string): Promise<DbBackupTable> {
    const artifact = new Artifact(this.ctx);
    await artifact.create({
      name: 'backup',
      type: 'backup',
    });
    const backup = new DbBackup(this.ctx);
    await backup.create({
      name: 'backup',
      artifact_id: artifact.id,
      type: type,
    });
    return this.uploadBackupTextProcess(text, backup, artifact);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async uploadBackupTextProcess(
    text: string,
    backup: DbBackup,
    artifact: Artifact
  ): Promise<DbBackupTable> {
    return backup.getData();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSchema(db: string): Promise<DbSchemaSchema> {
    return {
      tables: [],
    };
  }

  async saveSchema(dbId: string, name: string): Promise<DbSchemaTable> {
    const data = await this.getData();
    const db = await new Db(this.ctx, dbId).getData();
    const dbData = await this.getData();
    if (!name) {
      name =
        data.name +
        ' ' +
        dbData.name +
        ' ' +
        moment().format('YYYY-MM-DD HH:mm:ss');
    }
    const schema = await this.getSchema(db.name);
    return new DbSchema(this.ctx).create({
      schema,
      name,
    });
  }
}

export default BaseDbms;
