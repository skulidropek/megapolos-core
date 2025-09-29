import fse from 'fs-extra';
import simpleGit from 'simple-git';
import BaseRepo from './base.repository';
import {
  LogCommit,
  Repository,
  RepositoryFiles,
} from '../../domain/entities/Repository.entity';
import { resources, ResourceType } from '../rights/resources.list';
import { megapolosPath } from '../../..';

export default class RepositoryRepo extends BaseRepo<Repository> {
  get entityClass() {
    return Repository;
  }

  get resourceType(): ResourceType {
    return ResourceType.Repository;
  }

  async create(data: Partial<Repository>): Promise<Repository> {
    await this.checkActionAccess(resources.Repository.actions.create);
    const repositoryData = await super.create(data);
    const repository = new RepositoryRepo(this.ctx, repositoryData.id);
    await repository._clone();
    return repositoryData;
  }

  async update(data: Partial<Repository>): Promise<boolean> {
    await this.checkActionAccess(resources.Repository.actions.edit);
    const previousData = await this.getEntity();
    const result = await super.update(data);
    if (data.url && data.url !== previousData.url) {
      const path = await this._getPath();
      await fse.remove(path);
      await this._clone();
    }
    return result;
  }

  async delete(): Promise<boolean> {
    await this.checkActionAccess(resources.Repository.actions.remove);
    const path = await this._getPath();
    await fse.remove(path);
    return super.delete();
  }

  async fetch(): Promise<void> {
    await this.checkActionAccess(resources.Repository.actions.fetch);
    const path = await this._getPath();
    console.log('fetch', path);
    await simpleGit(path).fetch();
    await this.update({ lastFetchDate: new Date() });
  }

  async push(branchFrom: string, branchTo: string): Promise<void> {
    await this.checkActionAccess(resources.Repository.actions.push);
    await simpleGit(await this._getPath()).push(
      'origin',
      branchFrom + ':' + branchTo
    );
  }

  async copyBranchTo(path: string, branch: string): Promise<void> {
    await this.checkActionAccess(resources.Repository.actions.read);
    const repositoryPath = await this._getPath();
    if (!(await fse.exists(path))) {
      await fse.mkdir(path);
    }
    await fse.copy(repositoryPath, path);
    await simpleGit(path).checkout(branch);
  }

  async copyBranchWithCheckoutToCommit(
    path: string,
    branch: string,
    commitId: string
  ): Promise<void> {
    await this.checkActionAccess(resources.Repository.actions.read);
    const repositoryPath = await this._getPath();
    if (!(await fse.exists(path))) {
      await fse.mkdir(path);
    }
    await fse.copy(repositoryPath, path);

    if (branch) {
      await simpleGit(path).checkout(branch);
    }
    await simpleGit(path).checkout(commitId);
  }

  async getBranches(): Promise<string[]> {
    await this.checkActionAccess(resources.Repository.actions.read);
    const path = await this._getPath();
    return [
      ...(await simpleGit(path).branch()).all,
      ...(await simpleGit(path).tags()).all,
    ];
  }

  async getLastCommitOfBranch(branch: string): Promise<LogCommit | null> {
    await this.checkActionAccess(resources.Repository.actions.read);

    const git = simpleGit(await this._getPath());
    const logLatest = (await git.log([branch, '-n', '1'])).latest;

    const lastCommit: LogCommit | null = logLatest
      ? {
          hash: logLatest.hash,
          authorEmail: logLatest.author_email,
          authorName: logLatest.author_name,
          body: logLatest.body,
          date: new Date(logLatest.date),
          message: logLatest.message,
          refs: logLatest.refs,
        }
      : null;
    return lastCommit;
  }

  async getCommit(commitId: string): Promise<LogCommit | null> {
    await this.checkActionAccess(resources.Repository.actions.read);

    const git = simpleGit(await this._getPath());
    const logLatest = (await git.log([commitId])).latest;

    const commit: LogCommit | null = logLatest
      ? {
          hash: logLatest.hash,
          authorEmail: logLatest.author_email,
          authorName: logLatest.author_name,
          body: logLatest.body,
          date: new Date(logLatest.date),
          message: logLatest.message,
          refs: logLatest.refs,
        }
      : null;
    return commit;
  }

  async listFiles(branch: string, path: string): Promise<RepositoryFiles> {
    await this.checkActionAccess(resources.Repository.actions.read);
    if (path === '') {
      path = '.';
    } else {
      path += '/.';
    }
    const repositoryPath = await this._getPath();
    const files: string[] = [];
    const directories: string[] = [];
    const lines = (
      await simpleGit(repositoryPath).raw(['ls-tree', branch, path])
    ).split('\n');
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

  async showFile(branch: string, path: string): Promise<string> {
    await this.checkActionAccess(resources.Repository.actions.read);
    const repositoryPath = await this._getPath();
    return simpleGit(repositoryPath).show([branch + ':' + path]);
  }

  async _clone(): Promise<void> {
    const data = await this.getEntity();
    const path = await this._getPath();
    if (!(await fse.exists(path))) {
      await fse.mkdir(path);
    }
    if (data.user) {
      data.url = data.url.replace(
        /^https:\/\//,
        'https://' + data.user + ':' + data.password + '@'
      );
    }
    await simpleGit().clone(data.url, path);
    await this.update({ lastFetchDate: new Date() });
  }

  async _getPath(): Promise<string> {
    const data = await this.getEntity();
    return megapolosPath + '/repositories/' + data.id;
  }
}
