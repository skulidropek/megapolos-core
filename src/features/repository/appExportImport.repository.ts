import path from 'path';
import { writeFileSync, existsSync, unlinkSync, readFileSync } from 'node:fs';
import { App } from '../../domain/entities/App.entity';
import { ExportedAppMetadata } from '../../domain/entities/ExportedAppMetadata.entity';
import { makeEm } from '../db/mikro-orm';
import BaseRepo from './base.repository';
import AppRepo from './app.repository';
import RepositoryRepo from './repository.repository';
import { ConfigurationRepo } from './configuration.repository';
import AppVersionRepo from './app.version.repository';

const UPLOADS_DIR = path.join(__dirname, '../../../uploads');

export default class AppExportImportRepo extends BaseRepo<ExportedAppMetadata> {
  get entityClass() {
    return ExportedAppMetadata;
  }

  async exportApp(): Promise<void> {
    const em = makeEm();
    const app = await em.findOne(
      App,
      { id: this.id },
      {
        populate: [
          'repositories',
          'configurations',
          'configurations.services',
          'configurations.services.ports',
          'configurations.services.volumes',
          'configurations.services.dbs',
          'configurations.services.envs',
          'configurations.services.envs.valueOptions',
          'appVersions',
          'appVersions.images',
          'appVersions.images.envs',
        ],
      }
    );
    if (!app) {
      throw new Error('Application not found for export.');
    }

    const existing = await em.find(ExportedAppMetadata, {
      originalName: app.name,
    });
    if (existing.length > 0) {
      throw new Error('The application has already been exported.');
    }

    const fileName = `export-${app.name}-${this.id}-${Date.now()}.json`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    try {
      writeFileSync(filePath, JSON.stringify(app, null, 2), 'utf-8');

      await this.create({
        filename: fileName,
        originalName: app.name,
      });
    } catch (err) {
      throw new Error('Failed to export template application');
    }
  }

  async deleteExportedApp(): Promise<void> {
    const exportedApp = await this.getEntity();
    if (!exportedApp)
      throw new Error(
        'The app was not found. It may have already been deleted or not exported.'
      );
    const filePath = path.join(UPLOADS_DIR, exportedApp.filename);

    if (!existsSync(filePath)) {
      await this.delete();
      throw new Error(
        'Exported application file not found, but record was cleaned up'
      );
    }
    try {
      unlinkSync(filePath);
      await this.delete();
    } catch (err) {
      throw new Error('Failed to delete template app');
    }
  }

  async restoreApp(): Promise<void> {
    const em = makeEm();

    const exportedApp = await this.getEntity();
    if (!exportedApp)
      throw new Error(
        'The app was not found. It may have already been deleted or not exported.'
      );

    const [existingApp] = await em.find(App, {
      name: exportedApp.originalName,
    });
    if (existingApp)
      throw new Error('The application has already been restored.');

    const filePath = path.join(UPLOADS_DIR, exportedApp.filename);

    if (!existsSync(filePath)) {
      throw new Error('Exported application file not found');
    }
    let data: any;
    try {
      data = JSON.parse(readFileSync(filePath, 'utf-8'));
    } catch (err) {
      throw new Error('Failed to parse exported app file');
    }

    const idMap = {
      app: null,
      repositories: new Map(),
      configurations: new Map(),
    };

    try {
      const newApp = await new AppRepo(this.ctx).installApp(this.ctx.user.id, {
        name: data.name,
        description: data.description,
        images: data.images || [],
      });
      idMap.app = newApp.id;

      for (const repo of data.repositories) {
        const data = {
          url: repo.url,
          user: repo.user,
          password: repo.password,
          name: repo.name,
          repositoryType: repo.repositoryType,
          app: idMap.app,
        };
        const newRepo = await new RepositoryRepo(this.ctx).create(data);

        idMap.repositories.set(repo.id, newRepo.id);
      }

      for (const config of data.configurations) {
        const services = config.services.map((service) => {
          return {
            ...service,
            repository: idMap.repositories.get(service.repository),
          };
        });

        const newConfig = await new ConfigurationRepo(
          this.ctx
        ).createOrEditFromData({
          appId: idMap.app!,
          configurationData: { name: config.name, services },
        });

        idMap.configurations.set(config.id, newConfig.id);
      }
      for (const version of data.appVersions) {
        const newConfigId = idMap.configurations.get(version.configuration);
        if (!newConfigId) continue;

        const imagesData = version.images.map((img) => ({
          imageData: {
            name: img.name,
            role: img.role,
            image: img.image,
            innerPort: img.innerPort,
            hasState: img.hasState,
            buildNumber: img.buildNumber,
            version: img.version || '',
            versionComment: img.versionComment,
            branch: img.branch,
            status: img.status,
            repository: idMap.repositories.get(img.repository),
            app: idMap.app,
            commitId: img.commitId,
          },
        }));

        await new AppVersionRepo(this.ctx).createAppVersion(
          {
            app: idMap.app!,
            configuration: newConfigId,
            version: version.version,
            buildNumber: version.buildNumber,
            versionComment: version.versionComment,
          },
          imagesData
        );
      }
    } catch (err) {
      throw new Error('Restore failed');
    }
  }

  async uploadAppConfig(file) {
    const em = makeEm();
    const { filename, mimetype, encoding, createReadStream } = await file;
    if (!filename.endsWith('.json') && mimetype !== 'application/json') {
      throw new Error('Only .json files are allowed');
    }
    const chunks: Buffer[] = [];
    for await (const chunk of createReadStream()) {
      chunks.push(chunk as Buffer);
    }
    const jsonString = Buffer.concat(chunks).toString('utf8');

    let jsonData: any;
    try {
      jsonData = JSON.parse(jsonString);
    } catch (e) {
      throw new Error('Invalid JSON format');
    }

    const existing = await em.find(ExportedAppMetadata, {
      originalName: jsonData.name,
    });
    if (existing.length > 0) {
      throw new Error('The application has already been exported.');
    }

    if (
      typeof jsonData !== 'object' ||
      jsonData === null ||
      Array.isArray(jsonData)
    ) {
      throw new Error('JSON must be an object');
    }

    const obj = jsonData as Record<string, unknown>;

    const requiredFields = [
      'name',
      'appVersions',
      'configurations',
      'repositories',
    ];

    for (const field of requiredFields) {
      if (!(field in obj)) {
        throw new Error('The structure of the uploaded file is incorrect');
      }
    }
    const filePath = path.join(UPLOADS_DIR, filename);

    try {
      writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');

      await this.create({
        filename: filename,
        originalName: jsonData.name,
      });
    } catch (err) {
      throw new Error('Failed to export template application');
    }
  }
}
