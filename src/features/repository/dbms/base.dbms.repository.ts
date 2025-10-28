import moment from 'moment';
import ArtifactRepo from '../artifact.repository';
import BaseRepo from '../base.repository';
import DbRepo from '../db/db.repository';
import DbSchemaRepo from '../db/db.schema.repository';
import DbUserRepo from '../db/db.user.repository';
import DbBackupRepo from '../db/db.backup.repository';
import { Dbms } from '../../../domain/entities/Dbms.entity';
import { Db } from '../../../domain/entities/Db.entity';
import { DbUser } from '../../../domain/entities/DbUser.entity';
import { mem } from '../../db/mikro-orm';
import { DbBackup } from '../../../domain/entities/DbBackup.entity';
import {
  DbSchemaSchema,
  DbSchema,
} from '../../../domain/entities/DbSchema.entity';

export default class BaseDbmsRepo extends BaseRepo<Dbms> {
  get entityClass() {
    return Dbms;
  }

  async createDb(db: Partial<Db>, withoutChange: boolean = false): Promise<Db> {
    const result = await new DbRepo(this.ctx).create({
      ...db,
      dbms: this.id,
    });
    if (!withoutChange) {
      await this.createDbChange(db);
    }
    return result;
  }

  async createUser(
    user: Partial<DbUser>,
    withoutChange: boolean = false
  ): Promise<DbUser> {
    const result = await new DbUserRepo(this.ctx).create({
      ...user,
      dbms: this.id,
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
    await mem(async (em) => {
      const db = await em.findOne(Db, dbId);
      const dbUser = await em.findOne(DbUser, userId);
      db.users.add(dbUser);
      await em.flush();
    });

    if (!withoutChange) {
      const user = await new DbUserRepo(this.ctx, userId).getEntity();
      const db = await new DbRepo(this.ctx, dbId).getEntity();
      await this.addUserToDbChange(user.name, db.name);
    }
    return true;
  }

  async assignOwnerToDb(
    userId: string,
    dbId: string,
    withoutChange: boolean = false
  ): Promise<boolean> {
    const dbRepo = new DbRepo(this.ctx, dbId);
    await dbRepo.setOwner(userId);

    if (!withoutChange) {
      const user = await new DbUserRepo(this.ctx, userId).getEntity();
      const db = await dbRepo.getEntity();
      await this.assignOwnerToDbChange(user.name, db.name);
    }
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createDbChange(db: Partial<Db>): Promise<boolean> {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async truncateDbChange(dbName: string): Promise<boolean> {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createUserChange(user: Partial<DbUser>): Promise<boolean> {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async addUserToDbChange(userName: string, dbName: string): Promise<boolean> {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async assignOwnerToDbChange(
    userName: string,
    dbName: string
  ): Promise<boolean> {
    return true;
  }

  async getDbs(): Promise<Db[]> {
    return (await mem(async (em) => em.find(Db, { dbms: this.id }))) ?? [];
  }

  async getUsers(): Promise<DbUser[]> {
    return (await mem(async (em) => em.find(DbUser, { dbms: this.id }))) ?? [];
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
  ): Promise<DbBackup> {
    const data = await this.getEntity();
    const artifact = new ArtifactRepo(this.ctx);
    const db = new DbRepo(this.ctx, dbId);
    const dbData = await db.getEntity();
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
    const backup = new DbBackupRepo(this.ctx);
    await backup.create({
      name: name,
      artifact: artifact.id,
      type: data.type,
    });
    return this.backupProcess(db, backup, artifact, withoutData);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async backupProcess(
    db: DbRepo,
    backup: DbBackupRepo,
    artifact: ArtifactRepo,
    withoutData: boolean
  ): Promise<DbBackup> {
    return backup.getEntity();
  }

  async restore(dbId: string, backupId: string): Promise<boolean> {
    const db = new DbRepo(this.ctx, dbId);
    const backup = new DbBackupRepo(this.ctx, backupId);
    const artifact = await backup.getArtifactRepo();
    await this.truncateDbChange((await db.getEntity()).name);
    const result = await this.restoreProcess(db, backup, artifact);
    await this.restoreDbPrivileges(dbId);
    return result;
  }

  async cloneDb(
    fromDbId: string,
    toDbId: string,
    fromDbUserId?: string
  ): Promise<boolean> {
    const fromDb = await new DbRepo(this.ctx, fromDbId).getEntity();
    const toDb = await new DbRepo(this.ctx, toDbId).getEntity();
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
    const db = new DbRepo(this.ctx, dbId);
    const dbData = await db.getEntity();
    const users = await db.getUsers();
    for (let i in users) {
      const user = users[i];
      await this.addUserToDbChange(user.name, dbData.name);
    }
    return true;
  }

  async setOwner(dbId: string, userId: string): Promise<boolean> {
    const db = new DbRepo(this.ctx, dbId);
    const user = new DbUserRepo(this.ctx, userId);
    const dbData = await db.getEntity();
    const userData = await user.getEntity();
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

  async query(
    query: string,
    dbId: string,
    dbUserId?: string
  ): Promise<{
    db: Db;
    dbUser: DbUser;
    result: string;
    error?: string;
  }> {
    return this.queryChange(query, dbId, dbUserId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async queryChange(
    query: string,
    dbId: string,
    dbUserId?: string
  ): Promise<{
    db: Db;
    dbUser: DbUser;
    result: string;
    error?: string;
  }> {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async restoreProcess(
    db: DbRepo,
    backup: DbBackupRepo,
    artifact: ArtifactRepo
  ): Promise<boolean> {
    return true;
  }

  async downloadBackupText(backupId: string): Promise<string> {
    const backup = new DbBackupRepo(this.ctx, backupId);
    const artifact = await backup.getArtifactRepo();
    return this.downloadBackupTextProcess(backup, artifact);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async downloadBackupTextProcess(
    backup: DbBackupRepo,
    artifact: ArtifactRepo
  ): Promise<string> {
    return '';
  }

  async uploadBackupText(text: string, type: string): Promise<DbBackup> {
    const artifact = new ArtifactRepo(this.ctx);
    await artifact.create({
      name: 'backup',
      type: 'backup',
    });
    const backup = new DbBackupRepo(this.ctx);
    await backup.create({
      name: 'backup',
      artifact: artifact.id,
      type: type,
    });
    return this.uploadBackupTextProcess(text, backup, artifact);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async uploadBackupTextProcess(
    text: string,
    backup: DbBackupRepo,
    artifact: ArtifactRepo
  ): Promise<DbBackup> {
    return backup.getEntity();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSchema(db: string): Promise<DbSchemaSchema> {
    throw new Error('Not implemented');
  }

  async saveSchema(dbId: string, name: string): Promise<DbSchema> {
    const data = await this.getEntity();
    const db = new DbRepo(this.ctx, dbId);
    const dbData = await db.getEntity();
    if (!name) {
      name =
        data.name +
        ' ' +
        dbData.name +
        ' ' +
        moment().format('YYYY-MM-DD HH:mm:ss');
    }
    const schema = await this.getSchema(dbData.name);
    return new DbSchemaRepo(this.ctx).create({
      schema: JSON.stringify(schema),
      name,
    });
  }
}
