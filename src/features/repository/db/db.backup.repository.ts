import { DbBackup } from '../../../domain/entities/DbBackup.entity';
import ArtifactRepo from '../artifact.repository';
import BaseRepo from '../base.repository';

export default class DbBackupRepo extends BaseRepo<DbBackup> {
  get entityClass() {
    return DbBackup;
  }

  async delete(): Promise<boolean> {
    const backup = await this.getEntity();
    const result = await super.delete();
    if (result && backup.artifact) {
      await new ArtifactRepo(this.ctx, backup.artifact.id).delete();
    }
    return result;
  }

  async getArtifactRepo(): Promise<ArtifactRepo> {
    const data = await this.getEntity();
    return new ArtifactRepo(this.ctx, data.artifact.id);
  }
}
