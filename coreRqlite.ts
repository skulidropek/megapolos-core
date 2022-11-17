/// <reference> ./rqlite-ts/index.d.ts
import rqlite from 'rqlite-js';
import { DataResult, DataResults } from './rqlite-ts/api/results';
const dataApiClient = new rqlite.DataApiClient('http://localhost:4001');

const api = {
  query: async (query: string | string[][]):Promise<DataResults> => {
    const results/*:DataResults*/ = await dataApiClient.query(query);
    if (results.hasError()) {
      throw new Error(results.getFirstError());
    }
    const toArray = results.toArray.bind(results);
    results.toArray = () => toArray().filter(row => Object.keys(row).length > 0);
    return results;
  },
  execute: async (query: string | string[][]):Promise<DataResults> => {
    const results = await dataApiClient.execute(query);
    if (results.hasError()) {
      throw new Error(results.getFirstError());
    }
    const toArray = results.toArray.bind(results);
    results.toArray = () => toArray().filter(row => Object.keys(row).length > 0);
    return results;
  },
};

void (async () => {
  try {
    const dataResults = await api.query([['SELECT * FROM user']]);
  } catch (e) {
    console.error(e);
  }
})();

export default api;
