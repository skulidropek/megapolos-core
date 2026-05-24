import EventsObserver from '../events/eventsObserver';
import { resources, ResourceType } from '../rights/resources.list';
import BaseRepo from './base.repository';
import { AppInstance } from '../../domain/entities/AppInstance.entity';
import UserRepo from './user/user.repository';
import UserGroupRepo from './user/user.group.repository';
import ImageRepo from './image.repository';
import { Image } from '../../domain/entities/Image.entity';
import {
  ContainerRepo,
  ContainerResult,
  ContainerRuntimeVariables,
} from './cantainer/container.repository';
import { RequiredEntityData } from '@mikro-orm/core';
import { Container } from '../../domain/entities/Container.entity';
import { makeEm } from '../db/mikro-orm';
import AppVersionRepo from './app.version.repository';
import {
  ConfiguratedContainerInput,
  InstanceDataInput,
} from '../../api/graphql/resolvers/instance.resolver';
import DomainRepo from './domain.repository';
import VolumeRepo from './volume.repository';
import DbRepo from './db/db.repository';
import ContainerDbRepo from './cantainer/container.db.repository';
import DbUserRepo from './db/db.user.repository';
import { ContainerVariable } from '../../domain/entities/ContainerVariable.entity';
import { Domain } from '../../domain/entities/Domain.entity';
import { Db } from '../../domain/entities/Db.entity';
import { DbUser } from '../../domain/entities/DbUser.entity';
import { Volume } from '../../domain/entities/Volume.entity';
import { ContainerEnvOption } from '../../domain/entities/ContainerEnvOption.entity';
import ArtifactRepo from './artifact.repository';
import DbBackupRepo from './db/db.backup.repository';
import VolumeBackupRepo from './volume.backup.repository';
import AppInstanceBackupRepo from './app.instance.backup.repository';
import LogRepo from './log.repository';
import { LogType } from '../db/tables';
import DbmsRepo from './dbms/dbms.repository';
import AdmZip from 'adm-zip';
import fse from 'fs-extra';
import { megapolosPath } from '../../..';

export interface InstanceRuntimeVariables {
  containers: {
    [key: string]: ContainerRuntimeVariables;
  };
}

export interface InstanceBackupManifest {
  instanceId: string;
  name: string;
  exportDate: string;
  containers: {
    id: string;
    name: string;
    role: string;
    image: string;
    domains: string[];
    volumes: {
      name: string;
      role?: string;
      innerPath: string;
      backupFile: string;
    }[];
    databases: {
      name: string;
      role?: string;
      backupFile: string;
    }[];
  }[];
}

export interface AppInstanceResult extends AppInstance {
  containers?: ContainerResult[];
}

export default class AppInstanceRepo extends BaseRepo<AppInstance> {
  get entityClass() {
    return AppInstance;
  }

  get resourceType(): ResourceType {
    return ResourceType.AppInstance;
  }

  async create(
    input: RequiredEntityData<AppInstance>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isDevice = false
  ): Promise<AppInstance> {
    await this.checkActionAccess(resources.AppInstance.actions.create);
    const userGroup = (
      await new UserGroupRepo(this.ctx).getByFields({ name: 'root' })
    )[0];
    const user = await new UserRepo(this.ctx).create({
      name: input.name,
      // groupUserId: isDevice ? 'device' : 'app'
      groupUser: userGroup.id,
    });

    const result = await super.create({
      name: input.name,
      user: user.id,
      lifeStatus: input.lifeStatus || 'stopped',
      appInstanceUrl: input.name,
      app: input.app,
      description: input.description || '',
      appVersion: input.appVersion,
      // instance_type_id: 'dev',
      // deploy_strategy_id: '',
      // remove_strategy_id: '',
    });

    EventsObserver.listener({
      type: 'createAppInstance',
      data: { appInstanceId: result.id },
    });

    return result;
  }

  async getUserRepo(): Promise<UserRepo> {
    await this.checkActionAccess(resources.AppInstance.actions.read);
    const data = await this.getEntity();
    return new UserRepo(this.ctx, data.user.id);
  }

  async getDataWithContainers(): Promise<AppInstance> {
    await this.checkActionAccess(resources.AppInstance.actions.read);
    const appInstance: AppInstance & { containers?: Container[] } =
      await this.getEntity();
    appInstance.containers = await Promise.all(
      (
        await this.getContainers()
      ).map((container) =>
        new ContainerRepo(this.ctx, container.id).getDataWithDetails()
      )
    );
    return appInstance;
  }

  async start() {
    await this.checkActionAccess(resources.AppInstance.actions.manage);
    const containers = (await this.getContainers()).map(
      (container) => new ContainerRepo(this.ctx, container.id)
    );
    for (const i in containers) {
      const container = containers[i];
      await container.start();
    }

    await this.update({ lifeStatus: 'running' });

    EventsObserver.listener({
      type: 'startAppInstance',
      data: { id: this.id },
    });
  }

  async stop() {
    await this.checkActionAccess(resources.AppInstance.actions.manage);
    const containers = (await this.getContainers()).map(
      (container) => new ContainerRepo(this.ctx, container.id)
    );
    for (const i in containers) {
      const container = containers[i];
      await container.stop();
    }

    await this.update({ lifeStatus: 'stopped' });

    EventsObserver.listener({ type: 'stopAppInstance', data: { id: this.id } });
  }

  async update(data: RequiredEntityData<AppInstance>): Promise<boolean> {
    await this.checkActionAccess(resources.AppInstance.actions.edit);
    const result = await super.update(data);

    EventsObserver.listener({ type: 'editAppInstance', data: { id: this.id } });
    return result;
  }

  async changeInstanceVersion(appVersionId: string): Promise<boolean> {
    await this.checkActionAccess(resources.AppInstance.actions.change_version);
    this.ctx = this.ctx.cloneNoRightsCheck();

    return await makeEm().transactional(async (em) => {
      this?.ctx.setTransactionContextEM(em);

      const instance = await this.getEntity();
      const newAppVersionRepo = new AppVersionRepo(this.ctx, appVersionId);

      const newAppVesion = await newAppVersionRepo.getEntity();
      await this.update({ appVersion: newAppVesion });

      const containers = await this.getContainers();
      await newAppVesion.images.init();
      const newVersionImages = newAppVesion.images.getItems();
      for (const container of containers) {
        const cr = new ContainerRepo(this.ctx, container.id);
        const containerImage = await cr.getImage();
        const containerGitRepo = (await containerImage.getEntity()).repository;
        const img = newVersionImages.find(
          (image) => image.repository === containerGitRepo
        );
        if (img) {
          await cr.update({ image: img });
        }
      }

      em.persistAndFlush(instance);

      this?.ctx.reliseTransactionContextEM();
      return true;
    });
  }

  async changeInstancesVersion(
    instancesIds: string[],
    appVersionId: string
  ): Promise<boolean> {
    for (const id of instancesIds) {
      await new AppInstanceRepo(this.ctx, id).changeInstanceVersion(
        appVersionId
      );
    }

    return true;
  }

  async delete(): Promise<boolean> {
    await this.checkActionAccess(resources.AppInstance.actions.remove);
    const data = await this.getEntity();

    const containers = (await this.getContainers()).map(
      (container) => new ContainerRepo(this.ctx, container.id)
    );
    for (let i in containers) {
      const container = containers[i];
      await container.delete();
    };

    await super.delete();

    await new UserRepo(this.ctx, data.user.id).delete();

    EventsObserver.listener({
      type: 'removeAppInstance',
      data: { appInstanceId: this.id },
    });

    return true;
  }

  async getContainers(): Promise<Container[]> {
    await this.checkActionAccess(resources.AppInstance.actions.read);
    return new ContainerRepo(this.ctx).getByFields({
      appInstance: this.id,
    });
  }

  async build() {
    await this.checkActionAccess(resources.AppInstance.actions.build);
    const containers = (await this.getContainers()).map(
      (container) => new ContainerRepo(this.ctx, container.id)
    );
    const builded = [];
    for (const i in containers) {
      const container = containers[i];
      const image = await container.getImage();
      if (builded.includes(image.id)) {
        continue;
      }
      await image.build();
      builded.push(image.id);
    }
  }

  async getRuntimeVariables(): Promise<InstanceRuntimeVariables> {
    await this.checkActionAccess(resources.AppInstance.actions.read);
    const containers = await this.getContainers();
    const result: InstanceRuntimeVariables = { containers: {} };
    for (const i in containers) {
      const container = containers[i];
      const containerObject = new ContainerRepo(this.ctx, container.id);
      result.containers[container.role || container.name] =
        await containerObject.getRuntimeVariables(true);
    }
    return result;
  }

  async export(customName?: string): Promise<string> {
    await this.checkActionAccess(resources.AppInstance.actions.read);
    const instance = await this.getEntity();
    const containers = await this.getContainers();

    const artifactRepo = new ArtifactRepo(this.ctx);
    const exportArtifact = await artifactRepo.create({
      name: customName || ('Export instance ' + instance.name),
      type: 'instance_export',
    });

    const exportPath = await artifactRepo.getPath();
    const manifestPath = exportPath + '/manifest.json';
    const log = new LogRepo(this.ctx);
    await log.create({
      name: customName || ('Export instance ' + instance.name),
      type: LogType.InstanceExport,
      objectId: instance.id,
      objectName: instance.name,
    });

    const manifest: InstanceBackupManifest = {
      instanceId: instance.id,
      name: instance.name,
      exportDate: new Date().toISOString(),
      containers: [],
    };

    for (const container of containers) {
      const containerRepo = new ContainerRepo(this.ctx, container.id);
      const containerDomain = await containerRepo.getDomain();
      const containerVolumes = await containerRepo.getVolumes();
      const containerDbs = await new ContainerDbRepo(this.ctx).getByFields({
        container: container.id,
      });

      const image = (await containerRepo.getImage()).getEntity();

      const containerInfo = {
        id: container.id,
        name: container.name,
        role: container.role,
        image: (await image).image,
        domains: containerDomain ? [containerDomain.name] : [],
        volumes: [],
        databases: [],
      };

      // Backup Databases
      for (const containerDb of containerDbs) {
        const dbRepo = new DbRepo(this.ctx, containerDb.db.id);
        const db = await dbRepo.getEntity();
        const dbmsRepo = await DbmsRepo.getById(db.dbms.id);
        dbmsRepo.ctx = this.ctx;
        
        const dbBackup = await dbmsRepo.backup(
          db.id,
          customName ? `${customName} db ${db.name}` : 'Export ' + instance.name + ' db ' + db.name,
          false
        );

        const dbArtifactPath = await (await new DbBackupRepo(this.ctx, dbBackup.id).getArtifactRepo()).getPath();
        const dbBackupFile = 'db_' + container.role + '_' + db.name + '.sql';
        await fse.copy(dbArtifactPath + '/backup.sql', exportPath + '/' + dbBackupFile);

        containerInfo.databases.push({
          name: db.name,
          role: containerDb.role,
          backupFile: dbBackupFile,
        });
      }

      // Backup Volumes
      for (const item of containerVolumes) {
        const containerVolume = item.containerVolume;
        const volumeRepo = item.volume;
        const volume = await volumeRepo.getEntity();
        const volumeBackupRepo = new VolumeBackupRepo(this.ctx);
        const volumeBackup = await volumeBackupRepo.backup(
          volumeRepo,
          container.id,
          customName ? `${customName} vol ${volume.name}` : 'Export ' + instance.name + ' vol ' + volume.name
        );

        const volumeArtifactPath = await (new ArtifactRepo(this.ctx, volumeBackup.artifact.id)).getPath();
        const volumeBackupFile = 'vol_' + container.role + '_' + (containerVolume.role || 'default') + '.zip';
        await fse.copy(volumeArtifactPath + '/backup.zip', exportPath + '/' + volumeBackupFile);

        containerInfo.volumes.push({
          name: volume.name,
          role: containerVolume.role,
          innerPath: containerVolume.innerPath,
          backupFile: volumeBackupFile,
        });
      }

      manifest.containers.push(containerInfo);
    }

    // Write manifest
    await fse.writeJson(manifestPath, manifest, { spaces: 2 });

    // Create AppInstanceBackup record
    await new AppInstanceBackupRepo(this.ctx).create({
      name: customName || ('Export ' + instance.name + ' ' + new Date().toLocaleString()),
      appInstance: instance,
      artifact: exportArtifact,
    });

    await log.close();
    return exportArtifact.id;
  }

  async restoreFromBackup(backupId: string): Promise<boolean> {
    await this.checkActionAccess(resources.AppInstance.actions.edit);
    const instance = await this.getEntity();
    const backupRepo = new AppInstanceBackupRepo(this.ctx, backupId);
    const backupEntity = await backupRepo.getEntity();
    const artifactRepo = await backupRepo.getArtifactRepo();
    const artifactPath = await artifactRepo.getPath();

    const log = new LogRepo(this.ctx);
    await log.create({
      name: 'Restore instance ' + instance.name + ' from backup ' + (backupEntity.name || backupId),
      type: LogType.InstanceExport,
      objectId: instance.id,
      objectName: instance.name,
    });

    try {
      // 1. Backup current state
      await log.append('Backing up current state before restore...\n');
      await this.export('Auto-backup before restore of ' + (backupEntity.name || backupId));

      // 2. Identify manifest (now expecting it to be already extracted)
      const packagePath = artifactPath;
      const manifestPath = packagePath + '/manifest.json';
      
      if (!(await fse.pathExists(manifestPath))) {
        throw new Error('Manifest not found in backup. Make sure the uploaded archive contains manifest.json at the root.');
      }
      const manifest: InstanceBackupManifest = await fse.readJson(manifestPath);

      // 3. Match and Restore
      const containers = await this.getContainers();

      for (const containerInfo of manifest.containers) {
        const container = containers.find(c => c.role === containerInfo.role);
        if (!container) {
          await log.append(`Warning: Container with role ${containerInfo.role} not found in current instance. Skipping.\n`);
          continue;
        }

        // Restore Databases
        for (const dbInfo of containerInfo.databases) {
          const containerDbs = await new ContainerDbRepo(this.ctx).getByFields({
            container: container.id,
            role: dbInfo.role
          });
          const containerDb = containerDbs[0];
          if (!containerDb) {
            await log.append(`Warning: DB with role ${dbInfo.role} not found in container ${container.role}. Skipping.\n`);
            continue;
          }

          const dbRepo = new DbRepo(this.ctx, containerDb.db.id);
          const db = await dbRepo.getEntity();
          const dbmsRepo = await DbmsRepo.getById(db.dbms.id);
          dbmsRepo.ctx = this.ctx;

          // Create temporary backup entity for restore
          const tempArtifact = new ArtifactRepo(this.ctx);
          await tempArtifact.create({ name: 'Temp restore artifact', type: 'backup' });
          const tempArtifactPath = await tempArtifact.getPath();
          await fse.copy(packagePath + '/' + dbInfo.backupFile, tempArtifactPath + '/backup.sql');

          const tempBackup = new DbBackupRepo(this.ctx);
          const dbBackup = await tempBackup.create({
            name: 'Temp restore backup',
            artifact: tempArtifact.id,
            type: (await dbmsRepo.getEntity()).type
          });

          await log.append(`Restoring database ${db.name} for role ${dbInfo.role}...\n`);
          await dbmsRepo.restore(db.id, dbBackup.id);
        }

        // Restore Volumes
        for (const volInfo of containerInfo.volumes) {
          const containerVolumes = await new VolumeRepo(this.ctx).getVolumesOfContainer(container.id);
          const cv = containerVolumes.find(v => v.role === volInfo.role);
          if (!cv) {
            await log.append(`Warning: Volume with role ${volInfo.role} not found in container ${container.role}. Skipping.\n`);
            continue;
          }

          const volumeRepo = new VolumeRepo(this.ctx, cv.volume.id);
          await log.append(`Restoring volume ${volInfo.name} for role ${volInfo.role}...\n`);
          await volumeRepo.restore(container.id, packagePath + '/' + volInfo.backupFile, log);
        }
      }

      await log.append('Restore completed successfully.\n');
      await log.close();
      return true;
    } catch (e) {
      await log.append('Restore failed: ' + e.message + '\n');
      await log.close();
      throw e;
    }
  }

  async createConfiguratedInstance(
    appVersionId: string,
    instanceId: string | null,
    instanceData: InstanceDataInput
  ): Promise<AppInstance> {
    const appVersionRepo = new AppVersionRepo(this.ctx, appVersionId);
    const appVersion = await appVersionRepo.getEntity();

    return await makeEm().transactional(async (em) => {
      this.ctx.setTransactionContextEM(em);

      // Step 1. Create or reuse AppInstance
      let instance: AppInstance;
      if (instanceId) {
        instance = await new AppInstanceRepo(this.ctx, instanceId).getEntity();
      } else {
        instance = await this.create({
          name: instanceData.name,
          appVersion: appVersion,
          app: appVersion.app.id,
          lifeStatus: 'running',
        } as RequiredEntityData<AppInstance>);
      }

      // Step 2. Create containers
      for (const containerInput of instanceData.containers) {
        const containerRepo = new ContainerRepo(this.ctx);
        const container = await containerRepo.create({
          name: containerInput.name,
          role: containerInput.role,
          node: containerInput.node,
          image: containerInput.image,
          outerPort: containerInput.outerPort,
          appInstance: instance,
          lifeStatus: 'running',
        });

        // Step 3. Handle domain binding
        if (containerInput.domain) {
          const { id, domainData } = containerInput.domain;
          let domain: Domain;
          if (id) {
            domain = await new DomainRepo(this.ctx, id).getEntity();
          } else if (domainData) {
            domain = await new DomainRepo(this.ctx).create(domainData);
          }
          await containerRepo.update({ domain });
        }

        // Step 4. Handle volumes
        for (const volumeBindData of containerInput.volumes || []) {
          const innerVolume = volumeBindData.volume;
          let volumeEntity: Volume;
          if (innerVolume.id) {
            volumeEntity = await new VolumeRepo(
              this.ctx,
              innerVolume.id
            ).getEntity();
          } else if (innerVolume.volumeData) {
            volumeEntity = await new VolumeRepo(this.ctx).create(
              innerVolume.volumeData
            );
          }

          await new VolumeRepo(this.ctx, volumeEntity.id).addToContainer(
            container.id,
            volumeBindData.name,
            volumeBindData.innerPath,
            volumeBindData.role
          );
        }

        // Step 5. Handle DB bindings
        for (const dbBind of containerInput.dbs || []) {
          const { db, dbUser, role } = dbBind;
          let dbEntity: Db, dbUserEntity: DbUser;

          if (db.id) {
            dbEntity = await new DbRepo(this.ctx, db.id).getEntity();
          } else if (db.dbData) {
            dbEntity = await new DbRepo(this.ctx).create(db.dbData);
          }

          if (dbUser.id) {
            dbUserEntity = await new DbUserRepo(
              this.ctx,
              dbUser.id
            ).getEntity();
          } else if (dbUser.dbUserData) {
            dbUserEntity = await new DbUserRepo(this.ctx).create(
              dbUser.dbUserData
            );
          }

          await new ContainerDbRepo(this.ctx).create({
            container: container.id,
            db: dbEntity.id,
            dbUser: dbUserEntity.id,
            role,
          });
        }

        // Step 6. Handle environment variables
        if (containerInput.envs?.length) {
          const envInputs = containerInput.envs.map((env) => ({
            key: env.name,
            value: env.value,
          }));
          await containerRepo.changeEnvs(envInputs);
        }
      }

      await em.flush();
      this.ctx.reliseTransactionContextEM();
      return instance;
    });
  }
}
