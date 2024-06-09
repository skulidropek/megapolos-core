import { knex } from '../corePostgres';

export interface SearchResult {
  id: string;
  name: string;
  type: 'repository' | 'app' | 'image' | 'container' | 'node' | 'domain' | 'user' |
  'dbms' | 'db' | 'db_user' | 'db_backup' | 'db_schema' | 'app_instance' | 'log' | 'volume';
}

class Megapolos {
  async globalSearch(query: string): Promise<SearchResult[]> {
    const result: SearchResult[] = [];
    const tables = [
      'repository', 'app', 'image', 'container', 'node', 'domain', 'user',
      'dbms', 'db', 'db_user', 'db_backup', 'db_schema', 'app_instance', 'log', 'volume',
    ];
    for (const i in tables) {
      const table = tables[i];
      const data = await knex(table).select(['id', 'name']).where('name', 'like', `%${query}%`);
      result.push(...data.map((item: SearchResult) => ({ ...item, type: table as SearchResult['type'] })));
    }
    return result;
  }
}

export default Megapolos;