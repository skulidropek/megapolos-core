import { DbBackupTable } from '../modules/models/tables';
import Artifact from './Artifact';
import BaseRepository from './BaseRepository';

class DbBackup extends BaseRepository<DbBackupTable> {
  getTable(): string {
    return 'db_backup';
  }

  async getArtifact(): Promise<Artifact> {
    const data = await this.getData();
    return new Artifact(this.ctx, data.artifact_id);
  }
}

export default DbBackup;