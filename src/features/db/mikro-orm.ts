import { MikroORM } from '@mikro-orm/core';
import { SqlEntityManager } from '@mikro-orm/postgresql';
import mikroOrmConfig from './mikro-orm.config';

let orm: MikroORM;

async function initMikroOrm() {
  orm = await MikroORM.init(mikroOrmConfig);
}

function makeEm(): SqlEntityManager {
  return orm.em.fork() as SqlEntityManager;
}

export { initMikroOrm, makeEm, orm };
