import { megapolosPath } from '..';
import Entity from '../modules/models/Entity';
import { RepositoryTable } from '../modules/models/tables';
import simpleGit from 'simple-git';
import fse from 'fs-extra';

class Repository {
  id: string;

  static async create(data: Partial<Repository>): Promise<Repository> {
    const repositoryData = await new Entity<RepositoryTable>('repository').create(data);
    const repository = new Repository(repositoryData.id);
    await repository.clone();
    return repository;
  }

  static async getAllData():Promise<RepositoryTable[]> {
    return new Entity<RepositoryTable>('repository').findAll();
  }

  static async getAll():Promise<Repository[]> {
    const data = await this.getAllData();
    return data.map((item) => new Repository(item.id));
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
    const entity = new Entity<RepositoryTable>('repository');
    await entity.update({ id: this.id }, { last_fetch_date: new Date() });
  }

  async getPath():Promise<string> {
    const data = await this.getData();
    return megapolosPath + '/repositories/' + data.id;
  }

  async clone():Promise<void> {
    const data = await this.getData();
    const path = await this.getPath();
    if (!await fse.exists(path)) {
      await fse.mkdir(path);
    }
    if (data.user) {
      data.url = data.url.replace(/^https:\/\//, 'https://' + data.user + ':' + data.password + '@');
    }
    await simpleGit().clone(data.url, path);
    const entity = new Entity<RepositoryTable>('repository');
    await entity.update({ id: this.id }, { last_fetch_date: new Date() });
  }

  async copyBranchTo(path: string, branch: string):Promise<void> {
    const repositoryPath = await this.getPath();
    if (!await fse.exists(path)) {
      await fse.mkdir(path);
    }
    await fse.copy(repositoryPath, path);
    await simpleGit(path).checkout(branch);
  }

  async getBranches():Promise<string[]> {
    const path = await this.getPath();
    return [...(await simpleGit(path).branch()).all, ...(await simpleGit(path).tags()).all];
  }

  async listFiles(branch: string, path: string):Promise<{ files: string[], directories: string[] }> {
    if (path === '') {
      path = '.';
    } else {
      path += '/.';
    }
    const repositoryPath = await this.getPath();
    const files:string[] = [];
    const directories:string[] = [];
    const lines = (await simpleGit(repositoryPath).raw(['ls-tree', branch, path])).split('\n');
    for (const line of lines) {
      const parts = line.split(/\s+/);
      console.log(parts);
      if (parts.length > 1) {
        const name = parts[3];
        const type = parts[1];
        if (type === 'blob') {
          files.push(name);
        } else if (type === 'tree') {
          directories.push(name);
        }
      }
    }
    return { files, directories };
  }

  async showFile(branch: string, path: string):Promise<string> {
    const repositoryPath = await this.getPath();
    return simpleGit(repositoryPath).show([branch + ':' + path]);
  }

}

export default Repository;