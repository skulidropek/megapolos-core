import { App } from '../../domain/entities/App.entity';
import { AppExport } from '../../domain/entities/AppExport.entity';
import { makeEm } from '../db/mikro-orm';
import BaseRepo from './base.repository';
import AppRepo from './app.repository';
import RepositoryRepo from './repository.repository';
import { ConfigurationRepo } from './configuration.repository';
import AppVersionRepo from './app.version.repository';
import config from '../../domain/config/config';

export default class AppExportImportRepo extends BaseRepo<AppExport> {
  get entityClass() {
    return AppExport;
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

    const existing = await em.find(AppExport, {
      name: app.name,
    });
    if (existing.length > 0) {
      throw new Error('The application has already been exported.');
    }

    try {
      await this.create({
        name: app.name,
        manifest: app,
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
    try {
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
      name: exportedApp.name,
    });
    if (existingApp)
      throw new Error('The application has already been restored.');
    await this.installFromManifest(exportedApp.manifest);
  }

  async uploadAppConfig(file) {
    const em = makeEm();
    const { filename, mimetype, createReadStream } = await file;
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

    const existing = await em.find(AppExport, {
      name: jsonData.name,
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

    try {
      await this.create({
        name: jsonData.name,
        manifest: jsonData,
      });
    } catch (err) {
      throw new Error('Failed to export template application');
    }
  }

  async getListAppsStore() {
    try {
      const response = await fetch(`${config.catalogUrl}/apps`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`
        );
      }
      const files = await response.json();
      return files;
    } catch (err) {
      throw new Error('Error fetching files');
    }
  }

  async installAppFromStore() {
    try {
      const response = await fetch(`${config.catalogUrl}/apps/${this.id}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`
        );
      }
      const manifest = await response.json();
      await this.installFromManifest(manifest);
    } catch (err) {
      throw new Error('Error installing app from store: ' + err.message);
    }
  }
  private async installFromManifest(manifest: any): Promise<void> {
    const em = makeEm();

    const [existingApp] = await em.find(App, { name: manifest.name });
    if (existingApp)
      throw new Error('The application has already been installed.');

    const idMap = {
      app: null,
      repositories: new Map(),
      configurations: new Map(),
    };

    try {
      const newApp = await new AppRepo(this.ctx).installApp(this.ctx.user.id, {
        name: manifest.name,
        description: manifest.description,
        images: manifest.images || [],
      });
      idMap.app = newApp.id;

      for (const repo of manifest.repositories) {
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

      for (const config of manifest.configurations) {
        const services = config.services.map((service) => ({
          ...service,
          repository: idMap.repositories.get(service.repository),
        }));

        const newConfig = await new ConfigurationRepo(
          this.ctx
        ).createOrEditFromData({
          appId: idMap.app!,
          configurationData: { name: config.name, services },
        });

        idMap.configurations.set(config.id, newConfig.id);
      }

      for (const version of manifest.appVersions) {
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
      throw new Error(
        'Failed to install application from manifest: ' + err.message
      );
    }
  }
}
