import { megapolosPath } from '..';
import { ArtifactTable, DbmsTable } from '../modules/models/tables';
import BaseRepository from './BaseRepository';
import {readFile, writeFile} from 'fs-extra';

class Artifact extends BaseRepository<ArtifactTable> {
  getTable(): string {
    return 'artifact';
  }

  async getPath():Promise<string> {
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