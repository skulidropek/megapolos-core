import { megapolosPath } from '..';
import Entity from '../modules/models/Entity';
import { RepositoryTable } from '../modules/models/tables';
import simpleGit from 'simple-git';
import { promises as fs } from 'fs';
import fsSync from 'fs';

class Repository {
  id: string;

  static async create(name: string, url: string, user: string = undefined, password:string = undefined): Promise<Repository> {
    const data = await new Entity<RepositoryTable>('repository').create({ name, url, user, password });
    const repository = new Repository(data.id);
    await repository.clone();
  }

  constructor(id: string) {
    this.id = id;
  }

  async getData():Promise<RepositoryTable> {
    return new Entity<RepositoryTable>('repository').findOne({ id: this.id });
  }

  async fetch():Promise<void> {
    const path = await this.getPath();
    await simpleGit(path).fetch();
  }

  async getPath():Promise<string> {
    const data = await this.getData();
    return megapolosPath + '/repositories/' + data.id;
  }

  async clone():Promise<void> {
    const data = await this.getData();
    const path = await this.getPath();
    if (!fsSync.existsSync(path)) {
      await fs.mkdir(path);
    }
    if (data.user) {
      data.url = data.url.replace(/^https:\/\//, 'https://' + data.user + ':' + data.password + '@');
    }
    await simpleGit().clone(data.url, path);
  }

  async getBranches():Promise<string[]> {
    const path = await this.getPath();
    return (await simpleGit(path).branch()).all;
  }

}

export default Repository;