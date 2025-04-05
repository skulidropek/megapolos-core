import BaseRepo from '../base.repository';
import DbRepo from '../db/db.repository';
import { ContainerRepo } from './container.repository';
import DbUserRepo from '../db/db.user.repository';
import { ContainerDb } from '../../../domain/entities/ContainerDb.entity';

export default class ContainerDbRepo extends BaseRepo<ContainerDb> {
  get entityClass() {
    return ContainerDb;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async checkEntityData(
    entity: Partial<ContainerDb>,
    isCreate?: boolean
  ): Promise<boolean> {
    if (entity.container?.id) {
      await new ContainerRepo(this.ctx, entity.container.id).getEntity();
    }
    if (entity.db?.id) {
      await new DbRepo(this.ctx, entity.db.id).getEntity();
    }
    if (entity.dbUser?.id) {
      await new DbUserRepo(this.ctx, entity.dbUser.id).getEntity();
    }

    return true;
  }
}
