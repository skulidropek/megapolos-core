import { megapolosPath } from '../../..';
import { readFile, writeFile, mkdir } from 'fs-extra';
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

  async getPath(): Promise<string> {
    const data = await this.getEntity();
    return megapolosPath + '/artifacts/' + data.id;
  }

  async upload(file: string, path: string): Promise<void> {
    await writeFile(this.getPath() + '/' + file, path);
  }

  async download(file: string): Promise<string> {
    return readFile(this.getPath() + '/' + file, 'utf8');
  }
}
