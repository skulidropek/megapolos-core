import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import config from '../../domain/config/config';

const ormConfig: Options = {
  driver: PostgreSqlDriver,
  clientUrl: config.connectionString,
  entities: ['./src/domain/entities'],
  entitiesTs: ['./src/domain/entities'],
  discovery: {
    warnWhenNoEntities: false,
    requireEntitiesArray: false,
  },
  metadataProvider: TsMorphMetadataProvider,
  extensions: [EntityGenerator],
};

export default ormConfig;
