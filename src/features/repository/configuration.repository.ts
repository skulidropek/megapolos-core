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

export class ConfigurationRepo extends BaseRepo<Configuration> {
  get entityClass() {
    return Configuration;
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
