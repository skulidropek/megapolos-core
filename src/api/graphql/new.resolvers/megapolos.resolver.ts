import { Query, Ctx, Resolver, Arg } from 'type-graphql';
import { Context } from '../server';
import { knex } from '../../../features/db/knex';

import { Field, ObjectType, registerEnumType } from 'type-graphql';

enum SearchResultType {
  REPOSITORY = 'repository',
  APP = 'app',
  IMAGE = 'image',
  CONTAINER = 'container',
  NODE = 'node',
  DOMAIN = 'domain',
  USER = 'user',
  DBMS = 'dbms',
  DB = 'db',
  DB_USER = 'db_user',
  DB_BACKUP = 'db_backup',
  DB_SCHEMA = 'db_schema',
  APP_INSTANCE = 'app_instance',
  LOG = 'log',
  VOLUME = 'volume',
}

registerEnumType(SearchResultType, {
  name: 'SearchResultType',
  description: 'Типы результатов поиска в системе',
});

@ObjectType()
export class SearchResult {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => SearchResultType)
  type: SearchResultType;
}

class Megapolos {
  async globalSearch(query: string): Promise<SearchResult[]> {
    const result: SearchResult[] = [];
    const tables = [
      'repository',
      'app',
      'image',
      'container',
      'node',
      'domain',
      'user',
      'dbms',
      'db',
      'db_user',
      'db_backup',
      'db_schema',
      'app_instance',
      'log',
      'volume',
    ];
    for (const i in tables) {
      const table = tables[i];
      const data = await knex(table)
        .select(['id', 'name'])
        .where('name', 'like', `%${query}%`);
      result.push(
        ...data.map((item: SearchResult) => ({
          ...item,
          type: table as SearchResult['type'],
        }))
      );
    }
    return result;
  }
}

@Resolver()
export class MegapolosResolver {
  @Query(() => [SearchResult])
  async globalSearch(
    @Ctx() ctx: Context,
    @Arg('query') query: string
  ): Promise<SearchResult[]> {
    return new Megapolos().globalSearch(query);
  }
}
