import BaseRepo from '../base.repository';
import { Db } from '../../../domain/entities/Db.entity';
import { DbUser } from '../../../domain/entities/DbUser.entity';
import { makeEm } from '../../db/mikro-orm';
import { Dbms } from '../../../domain/entities/Dbms.entity';
import BaseDbmsRepo from '../dbms/base.dbms.repository';

export default class DbRepo extends BaseRepo<Db> {
  get entityClass() {
    return Db;
  }

  async getUsers(): Promise<DbUser[]> {
    const em = makeEm();
    const db = await em.findOne(Db, { id: this.id }, { populate: ['users'] });
    return db.users.getItems();
  }

  async getDbms(): Promise<Dbms> {
    const data = await this.getEntity();
    return new BaseDbmsRepo(this.ctx, data.dbms.id).getEntity();
  }
}
