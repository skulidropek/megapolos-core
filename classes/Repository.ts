import { megapolosPath } from '..';
import { RepositoryTable } from '../modules/models/tables';
import simpleGit from 'simple-git';
import fse from 'fs-extra';
import BaseRepository from './BaseRepository';

class Repository extends BaseRepository<RepositoryTable> {
  getTable(): string {
    return 'repository';
  }

  async create(data: Partial<RepositoryTable>): Promise<RepositoryTable> {
    const repositoryData = await super.create(data);
    const repository = new Repository(repositoryData.id);
    await repository.clone();
    return repositoryData;
  }

  async edit(data: Partial<RepositoryTable>):Promise<RepositoryTable> {
    const previousData = await this.getData();
    const result = await super.edit(data);
    if (data.url && data.url !== previousData.url) {
      const path = await this.getPath();
      await fse.remove(path);
      await this.clone();
    }
    return result;
  }

  async delete():Promise<boolean> {
    const path = await this.getPath();
    await fse.remove(path);
    return super.delete();
  }

  async fetch():Promise<void> {
    const path = await this.getPath();
    await simpleGit(path).fetch();
    await this.edit({ last_fetch_date: new Date() });
  }

  async push(branchFrom: string, branchTo: string):Promise<void> {
    await simpleGit(await this.getPath()).push('origin', branchFrom + ':' + branchTo);
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
    await this.edit({ last_fetch_date: new Date() });
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