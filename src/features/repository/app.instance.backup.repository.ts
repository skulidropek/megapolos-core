import { AppInstanceBackup } from '../../domain/entities/AppInstanceBackup.entity';
import BaseRepo from './base.repository';
import ArtifactRepo from './artifact.repository';
import { FileUpload } from 'graphql-upload-ts';
import fse from 'fs-extra';
import AdmZip from 'adm-zip';

export default class AppInstanceBackupRepo extends BaseRepo<AppInstanceBackup> {
  get entityClass() {
    return AppInstanceBackup;
  }

  async uploadBackup(file: Promise<FileUpload>): Promise<AppInstanceBackup> {
    const { createReadStream, filename } = await file;
    const stream = createReadStream();

    const artifactRepo = new ArtifactRepo(this.ctx);
    const artifact = await artifactRepo.create({
      name: 'Uploaded backup: ' + filename,
      type: 'instance_export',
    });

    const artifactPath = await artifactRepo.getPath();
    const tempFilePath = artifactPath + '/upload.zip';

    return new Promise((resolve, reject) => {
      const writeStream = fse.createWriteStream(tempFilePath);
      stream.pipe(writeStream);
      writeStream.on('finish', async () => {
        try {
          // Unzip the uploaded archive into the artifact directory
          const zip = new AdmZip(tempFilePath);
          zip.extractAllTo(artifactPath, true);
          
          // Remove the temp zip file
          await fse.remove(tempFilePath);

          const backup = await this.create({
            name: 'Manual upload: ' + filename,
            artifact: artifact,
          });
          resolve(backup);
        } catch (err) {
          reject(err);
        }
      });
      writeStream.on('error', reject);
    });
  }

  async getArtifactRepo(): Promise<ArtifactRepo> {
    const data = await this.getEntity();
    if (!data.artifact) {
      throw new Error('Backup has no artifact');
    }
    return new ArtifactRepo(this.ctx, data.artifact.id);
  }
}
