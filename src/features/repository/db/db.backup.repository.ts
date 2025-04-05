import { DbBackup } from '../../../domain/entities/DbBackup.entity';
import ArtifactRepo from '../artifact.repository';
import BaseRepo from '../base.repository';

export default class DbBackupRepo extends BaseRepo<DbBackup> {
  get entityClass() {
    return DbBackup;
  }

  async getArtifactRepo(): Promise<ArtifactRepo> {
    const data = await this.getEntity();
    return new ArtifactRepo(this.ctx, data.artifact.id);
  }
}
