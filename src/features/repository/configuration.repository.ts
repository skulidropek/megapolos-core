import BaseRepo from './base.repository';
import { App } from '../../domain/entities/App.entity';
import {
  Configuration,
  ConfigurationService,
  ConfigurationDbWithUser,
  ConfigurationEnvOption,
  ConfigurationEnvOptionValue,
  ConfigurationPort,
  ConfigurationVolume,
} from '../../domain/entities/configuration/Configuration.entity';
import { ConfigurationDataInput } from '../../api/graphql/resolvers/configuration.resolver';

export class ConfigurationRepo extends BaseRepo<Configuration> {
  get entityClass() {
    return Configuration;
  }

  async createOrEditFromData({
    appId,
    configurationData,
  }: {
    appId?: string;
    configurationData: ConfigurationDataInput;
  }): Promise<Configuration> {
    if (!appId && !this.id) {
      throw new Error('Either appId or configuration id must be provided');
    }
    const em = this._getEM();
    return await em.transactional(async (tx) => {
      let configuration: Configuration;
      const id = this.id;
      if (id) {
        configuration = await tx.findOneOrFail(Configuration, { id }, {});
        configuration.name = configurationData.name;
        await configuration.services.loadItems();
        for (let i in configuration.services.getItems()) {
          const service = configuration.services.getItems()[i];
          await service.envs.loadItems();
          service.envs.removeAll();
          await service.dbs.loadItems();
          service.dbs.removeAll();
          await service.ports.loadItems();
          service.ports.removeAll();
          await service.volumes.loadItems();
          service.volumes.removeAll();
        }
        configuration.services.removeAll();
      } else {
        const app = await tx.findOneOrFail(App, { id: appId });
        configuration = await tx.create(Configuration, {
          app,
          name: configurationData.name,
        });
      }

      for (const serviceInp of configurationData.services) {
        const service = tx.create(ConfigurationService, {
          configuration,
          role: serviceInp.role,
        });

        for (const volInp of serviceInp.volumes) {
          const vol = tx.create(ConfigurationVolume, {
            service,
            role: volInp.role,
            innerPath: volInp.innerPath,
          });
          service.volumes.add(vol);
        }

        for (const portInp of serviceInp.ports) {
          const port = tx.create(ConfigurationPort, {
            service,
            role: portInp.role,
            innerPort: portInp.innerPort,
            outerPort: portInp.outerPort,
            isDomainRequired: portInp.isDomainRequired,
            isLoginAndPasswordRequired: portInp.isLoginAndPasswordRequired,
          });
          service.ports.add(port);
        }

        for (const dbInp of serviceInp.dbs) {
          const db = tx.create(ConfigurationDbWithUser, {
            service,
            dbRole: dbInp.dbRole,
            dbUserRole: dbInp.dbUserRole,
          });
          service.dbs.add(db);
        }

        for (const envInp of serviceInp.envs) {
          const envOption = tx.create(ConfigurationEnvOption, {
            service,
            name: envInp.name,
            defaultValue: envInp.defaultValue,
            type: envInp.type,
            isRequired: envInp.isRequired,
          });

          envInp.valueOptions.forEach((value, index) => {
            const envValue = tx.create(ConfigurationEnvOptionValue, {
              env: envOption,
              value,
              order: index,
            });
            envOption.valueOptions.add(envValue);
          });

          service.envs.add(envOption);
        }

        configuration.services.add(service);
      }

      await tx.persistAndFlush(configuration);
      return configuration;
    });
  }

  async deleteCascade(): Promise<Boolean> {
    const em = this._getEM();
    await em.transactional(async (tx) => {
      const configuration = await tx.findOneOrFail(
        Configuration,
        { id: this.id },
        {
          populate: [
            'services',
            'services.volumes',
            'services.ports',
            'services.dbs',
            'services.envs',
            'services.envs.valueOptions',
          ],
        }
      );

      await tx.removeAndFlush(configuration);
    });
    return true;
  }

  async getServices(): Promise<ConfigurationService[]> {
    return new ConfigurationServiceRepo(this.ctx).getByFields({
      configuration: { id: this.id },
    });
  }
}

export class ConfigurationServiceRepo extends BaseRepo<ConfigurationService> {
  get entityClass() {
    return ConfigurationService;
  }

  async getVolumes(): Promise<ConfigurationVolume[]> {
    return new ConfigurationVolumeRepo(this.ctx).getByFields({
      service: { id: this.id },
    });
  }

  async getPorts(): Promise<ConfigurationPort[]> {
    return new ConfigurationPortRepo(this.ctx).getByFields({
      service: { id: this.id },
    });
  }

  async getDbs(): Promise<ConfigurationDbWithUser[]> {
    return new ConfigurationDbWithUserRepo(this.ctx).getByFields({
      service: { id: this.id },
    });
  }

  async getEnvs(): Promise<ConfigurationEnvOption[]> {
    return new ConfigurationEnvOptionRepo(this.ctx).getByFields({
      service: { id: this.id },
    });
  }
}

export class ConfigurationVolumeRepo extends BaseRepo<ConfigurationVolume> {
  get entityClass() {
    return ConfigurationVolume;
  }
}

export class ConfigurationPortRepo extends BaseRepo<ConfigurationPort> {
  get entityClass() {
    return ConfigurationPort;
  }
}

export class ConfigurationDbWithUserRepo extends BaseRepo<ConfigurationDbWithUser> {
  get entityClass() {
    return ConfigurationDbWithUser;
  }
}

export class ConfigurationEnvOptionRepo extends BaseRepo<ConfigurationEnvOption> {
  get entityClass() {
    return ConfigurationEnvOption;
  }

  async getValueOptions(): Promise<string[]> {
    const valueOptions = await new ConfigurationEnvOptionValueRepo(
      this.ctx
    ).getByFields({
      env: { id: this.id },
    });
    return valueOptions.sort((a, b) => a.order - b.order).map((o) => o.value);
  }
}

export class ConfigurationEnvOptionValueRepo extends BaseRepo<ConfigurationEnvOptionValue> {
  get entityClass() {
    return ConfigurationEnvOptionValue;
  }
}
