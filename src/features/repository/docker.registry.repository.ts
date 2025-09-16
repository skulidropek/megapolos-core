import { DockerRegistry } from '../../domain/entities/DockerRegistry.entity';
import BaseRepo from './base.repository';
import { makeEm } from './../db/mikro-orm';
import config from '../../domain/config/config';

export default class DockerRegistryRepo extends BaseRepo<DockerRegistry> {
  get entityClass() {
    return DockerRegistry;
  }

  async setAsDefault(): Promise<boolean> {
    await makeEm().nativeUpdate(DockerRegistry, {}, { isDefault: false });
    await this.update({ isDefault: true });

    return true;
  }

  async setAsNonDefault(): Promise<boolean> {
    await this.update({ isDefault: false });

    return true;
  }

  async getDefault(): Promise<DockerRegistry | null> {
    const registries = await this.getByFields({ isDefault: true });
    const defaultDockerRegistry = registries?.[0] ?? null;

    return (
      defaultDockerRegistry ??
      Object.assign(new DockerRegistry(), {
        host: config.registryHost,
        user: config.registryUser,
        password: config.registryPassword,
      })
    );
  }
}
