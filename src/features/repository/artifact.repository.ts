import { megapolosPath } from '../../..';
import fse, { readFile, writeFile, mkdir } from 'fs-extra';
import { Artifact } from '../../domain/entities/Artifact.entity';
import BaseRepo from './base.repository';

export default class ArtifactRepo extends BaseRepo<Artifact> {
  get entityClass() {
    return Artifact;
  }

  async create(entity: Partial<Artifact>): Promise<Artifact> {
    const result = await super.create(entity);
    await mkdir(await this.getPath());
    return result;
  }

  async delete(): Promise<boolean> {
    const path = await this.getPath();
    const result = await super.delete();
    if (result && (await fse.pathExists(path))) {
      await fse.remove(path);
    }
    return result;
  }

  async getPath(): Promise<string> {
    const data = await this.getEntity();
    if (!data?.id) {
      throw new Error('Artifact ID is not set');
    }
    return megapolosPath + '/artifacts/' + data.id;
  }

  async upload(file: string, path: string): Promise<void> {
    await writeFile((await this.getPath()) + '/' + file, path);
  }

  async download(file: string): Promise<string> {
    return readFile((await this.getPath()) + '/' + file, 'utf8');
  }

  async getSize(): Promise<number> {
    const path = await this.getPath();
    if (!(await fse.pathExists(path))) {
      return 0;
    }
    return this._getFolderSize(path);
  }

  private async _getFolderSize(path: string): Promise<number> {
    const stats = await fse.stat(path);
    if (!stats.isDirectory()) {
      return stats.size;
    }
    const files = await fse.readdir(path);
    const sizes = await Promise.all(
      files.map((file) => this._getFolderSize(path + '/' + file))
    );
    return sizes.reduce((a, b) => a + b, 0);
  }
}
