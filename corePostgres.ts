import Knex from 'knex';
import config from './config/config';

export const knex = Knex({
  client: 'pg',
  connection: {
    connectionString: config.connectionString,
  },
  pool: {
    min: 0,
    max: 10,
    acquireTimeoutMillis: 60000,
    idleTimeoutMillis: 600000,
  },
});
