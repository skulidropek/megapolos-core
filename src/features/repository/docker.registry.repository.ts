import { DockerRegistry } from '../../domain/entities/DockerRegistry.entity';
import BaseRepo from './base.repository';
import { makeEm } from './../db/mikro-orm';

export default class DockerRegistryRepo extends BaseRepo<DockerRegistry> {
  get entityClass() {
    return DockerRegistry;
  }

  async setAsDefault(): Promise<boolean> {
    const thisDocReg = await this.getEntity();

    await makeEm().transactional(async (tx) => {
      await tx.nativeUpdate(DockerRegistry, {}, { isDefault: false });
      await tx.nativeUpdate(
        DockerRegistry,
        { id: thisDocReg.id },
        { isDefault: true }
      );
    });

    return true;
  }
}
