import { appendFile, readFile, rm, writeFile } from 'fs-extra';
import { megapolosPath } from '../../..';
import { LogTable } from '../db/tables';
import BaseRepository from './BaseRepository';

class Log extends BaseRepository<LogTable> {
  getTable(): string {
    return 'log';
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

  async create(entity: Partial<LogTable>): Promise<LogTable> {
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
    await this.edit({
      is_closed: true,
      close_date: new Date(),
    });
    return true;
  }
}

export default Log;