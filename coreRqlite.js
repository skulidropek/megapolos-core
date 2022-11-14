import rqlite from 'rqlite-js';

const { DataApiClient } = rqlite;

const dataApiClient = new DataApiClient('http://localhost:4001');

const dataResults = await dataApiClient.query('SELECT * FROM user');
console.log(dataResults.results.map((result) => result.data));

export default dataApiClient;
