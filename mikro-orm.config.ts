import { MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import config from './src/domain/config/config';

export default {
  driver: PostgreSqlDriver,
  clientUrl: config.connectionString,
  entities: ['./dist/domain/entites/*.js'], // Путь к скомпилированным сущностям
  entitiesTs: ['./src/domain/entites/*.ts'], // Путь к исходным TS файлам
  migrations: {
    path: './dist/migrations', // Путь к скомпилированным миграциям
    pathTs: './src/migrations', // Путь к исходным TS файлам миграций
  },
  metadataProvider: TsMorphMetadataProvider,
  extensions: [EntityGenerator],
} as Parameters<typeof MikroORM.init>[0];
