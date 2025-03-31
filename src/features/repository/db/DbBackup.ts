import { DbBackupTable } from '../../db/tables';
import Artifact from '../../repository/Artifact';
import BaseRepository from '../../repository/BaseRepository';

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
