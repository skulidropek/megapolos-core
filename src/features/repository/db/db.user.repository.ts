import { Db } from '../../../domain/entities/Db.entity';
import { Dbms } from '../../../domain/entities/Dbms.entity';
import { DbUser } from '../../../domain/entities/DbUser.entity';
import { mem } from '../../db/mikro-orm';
import BaseRepo from '../base.repository';

export default class DbUserRepo extends BaseRepo<DbUser> {
  get entityClass() {
    return DbUser;
  }

  async getDbs(): Promise<Db[]> {
    return (
      await mem(async (em) =>
        em.findOne(DbUser, { id: this.id }, { populate: ['dbs'] })
      )
    ).dbs.getItems();
  }

  async getOwnedDbs(): Promise<Db[]> {
    return (
      await mem(async (em) =>
        em.findOne(DbUser, { id: this.id }, { populate: ['ownedDbs'] })
      )
    ).dbs.getItems();
  }

  async getDbms(): Promise<Dbms> {
    return (
      await mem(async (em) =>
        em.findOne(DbUser, { id: this.id }, { populate: ['dbms'] })
      )
    ).dbms;
  }
}
