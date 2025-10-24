import { MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import config from '../../domain/config/config';
import { AppVersion } from '../../domain/entities/AppVersion.entity';

export default {
  driver: PostgreSqlDriver,
  clientUrl: config.connectionString,
  entities: [AppVersion],
  metadataProvider: TsMorphMetadataProvider,
  extensions: [EntityGenerator],
  debug: true,
} as Parameters<typeof MikroORM.init>[0];

/*
Это инспекционная конфигурация Micro-ORM, 
предназначена для просмотра генерируемого, а значит понимаего ORM, Sql кода,
по сущностно. В entities добавьте одну(!) интересующую вас для инспеции сущность,
из основной директории вызовите команду:

$ npx mikro-orm schema:create --dump --config src/features/db/mikro-orm.patch.config.ts | pg_format

В консоль выведет генерируемый SQL для нее код, и всех связанных с ней сущностей.

Пояснение по флагам и пайплайну команд:
--dump - выводит sql в консоль, а не пытается, как по умолчанию, выполнить в БД
--config - путь к этому файлу
pg_format - форматирование SQL вывода, текущий вывод тяжело читать, попробуйте без "| pg_format"

Пререквизиты:
Установить форматер
$ apt install pgformatter


Иные запроса:
Показать запросы устроняющие разницу текущей схемы в БД и метаданных(сущностей).
Полезно для обновления, выбирай нужное.
$ npx mikro-orm schema:update --dump --config src/features/db/mikro-orm.patch.config.ts | pg_format

*/
