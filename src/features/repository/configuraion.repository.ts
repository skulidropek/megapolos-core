import BaseRepo from './base.repository';
import { App } from '../../domain/entities/App.entity';
import {
  Configuraion,
  ConfiguraionService,
  ConfigurationDbWithUser,
  ConfigurationEnvOption,
  ConfigurationEnvOptionValue,
  ConfigurationPort,
  ConfigurationVolume,
} from '../../domain/entities/configuration/Configuraion.entity';

export class ConfiguraionRepo extends BaseRepo<Configuraion> {
  get entityClass() {
    return Configuraion;
  }

  async getServices(): Promise<ConfiguraionService[]> {
    return new ConfiguraionServiceRepo(this.ctx).getByFields({
      configuraion: { id: this.id },
    });
  }
}

export class ConfiguraionServiceRepo extends BaseRepo<ConfiguraionService> {
  get entityClass() {
    return ConfiguraionService;
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
