import { megapolosPath } from '../../..';
import { ArtifactTable } from '../db/tables';
import BaseRepository from './BaseRepository';
import { readFile, writeFile, mkdir } from 'fs-extra';

class Artifact extends BaseRepository<ArtifactTable> {
  getTable(): string {
    return 'artifact';
  }

  async create(entity: Partial<ArtifactTable>): Promise<ArtifactTable> {
    const result = await super.create(entity);
    await mkdir(await this.getPath());
    return result;
  }

  async getPath(): Promise<string> {
    const data = await this.getData();
    return megapolosPath + '/artifacts/' + data.id;
  }

  async upload(file: string, path: string): Promise<void> {
    await writeFile(this.getPath() + '/' + file, path);
  }

  async download(file: string): Promise<string> {
    return readFile(this.getPath() + '/' + file, 'utf8');
  }
}

export default Artifact;
