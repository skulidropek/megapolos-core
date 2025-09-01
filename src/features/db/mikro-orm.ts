import { MikroORM } from '@mikro-orm/core';
import { SqlEntityManager } from '@mikro-orm/postgresql';
import mikroOrmConfig from './mikro-orm.config';

let orm: MikroORM;

async function initMikroOrm() {
  orm = await MikroORM.init(mikroOrmConfig);
}

async function mem<T>(fn: (em: SqlEntityManager) => Promise<T>): Promise<T> {
  return await fn(makeEm());
}

function makeEm(): SqlEntityManager {
  return orm.em.fork() as SqlEntityManager;
}

export { initMikroOrm, mem, makeEm, orm };
