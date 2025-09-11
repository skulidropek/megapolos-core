import { appendFile, readFile, rm, writeFile } from 'fs-extra';
import { megapolosPath } from '../../..';
import BaseRepo from './base.repository';
import { Log } from '../../domain/entities/Log.entity';
import {
  defaultRights,
  resources,
  ResourceType,
  UserAction,
} from '../rights/resources.list';
import UserRepo from './user/user.repository';
import { RightsChecker } from '../rights/RightsChecker';
import { makeEm } from '../db/mikro-orm';

export default class LogRepo extends BaseRepo<Log> {
  get entityClass() {
    return Log;
  }

  async getText(): Promise<string> {
    return readFile(this.getFilePath(), 'utf8');
  }

  getFilePath() {
    if (!this.id) {
      throw new Error('No id');
    }
    return megapolosPath + '/logs/' + this.id + '.log';
  }

  async create(entity: Partial<Log>): Promise<Log> {
    const result = await super.create(entity);
    await writeFile(this.getFilePath(), '');
    return result;
  }

  async delete(): Promise<boolean> {
    await rm(this.getFilePath());
    return super.delete();
  }

  async append(data: string): Promise<boolean> {
    await appendFile(this.getFilePath(), data);
    return true;
  }

  async close(): Promise<boolean> {
    await this.update({
      isClosed: true,
      closeDate: new Date(),
    });
    return true;
  }

  private _logEntityToLogViewAction(log): UserAction | null {
    if (log.nodeId) {
      return {
        resourceType: ResourceType.Node,
        resourceId: log.nodeId,
        action: defaultRights.view_log,
      };
    }

    if (log.objectId && log.objectName && resources[log.objectName]) {
      return {
        resourceType: log.objectName,
        resourceId: log.objectId,
        action: defaultRights.view_log,
      };
    }

    return null;
  }

  override async haveActionAccess(action: string): Promise<boolean> {
    if (action !== defaultRights.read) {
      return super.haveActionAccess(action);
    }

    if (
      this.ctx?.noRightsCheck ||
      !this.checkRights ||
      !this.ctx?.user ||
      this.ctx?.user?.groupUser.id == UserRepo.rootRoleId
    ) {
      return true;
    }

    const log = (await makeEm().findOne(this.entityClass, {
      id: this.id,
    })) as Log;

    return RightsChecker.checkByAction(
      this.ctx.user.id,
      log,
      this._logEntityToLogViewAction
    );
  }

  override async filterEntitiesByAccess(logs: Log[]): Promise<Log[]> {
    if (
      this.ctx?.noRightsCheck ||
      !this.ctx?.user ||
      this.ctx?.user?.groupUser.id == UserRepo.rootRoleId
    ) {
      return logs;
    }

    return await RightsChecker.filterByAction(
      this.ctx.user.id,
      logs,
      this._logEntityToLogViewAction
    );
  }
}
