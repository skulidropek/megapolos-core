import rqlite from 'rqlite-js';

const { DataApiClient } = rqlite;

const dataApiClient = new DataApiClient('http://localhost:4001');

void (async () => {
  const dataResults = await dataApiClient.query([['SELECT * FROM user']]);
})();

export default dataApiClient;
