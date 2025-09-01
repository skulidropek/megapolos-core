import { appendFile, readFile, rm, writeFile } from 'fs-extra';
import { megapolosPath } from '../../..';
import BaseRepo from './base.repository';
import { Log } from '../../domain/entities/Log.entity';

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
}
