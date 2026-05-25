// /* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

// import jwt, { JwtPayload } from 'jsonwebtoken';
// import { createServer } from 'http';
// import { SubscriptionServer } from 'subscriptions-transport-ws';
// import express from 'express';
// import { ApolloServer } from 'apollo-server-express';
// import { createApplication } from 'graphql-modules';
// import userModule from './resolvers/user.resolver';
// import nodeModule from './resolvers/node.resolver';
// import appModule from './resolvers/app.resolver';
// import eventModule from './resolvers/event.resolver';
// import volumeModule from './resolvers/volume.resolver';
// import User from '../../features/repository/user/User';
// import EventsObserver from '../../features/events/eventsObserver';
// import repositoryModule from './resolvers/repository.resolver';
// import instanceModule from './resolvers/instance.resolver';
// import containerModule from './resolvers/container.resolver';
// import imageModule from './resolvers/image.resolver';
// import domainModule from './resolvers/domain.resolver';
// import dbmsModule from './resolvers/dbms.resolver';
// import logModule from './resolvers/log.resolver';
// import megapolosModule from './resolvers/megapolos.resolver';
// import { Context } from '../../domain/types';
// import config from '../../domain/config/config';

// const graphqlServer = async () => {
//   try {
//     const application = createApplication({
//       modules: [
//         userModule,
//         nodeModule,
//         appModule,
//         // deviceModule,
//         eventModule,
//         volumeModule,
//         // resourceModule,
//         repositoryModule,
//         instanceModule,
//         containerModule,
//         imageModule,
//         domainModule,
//         dbmsModule,
//         logModule,
//         megapolosModule,
//       ],
//     });

//     const {
//       schema,
//       createExecution,
//       createSubscription,
//       createApolloExecutor,
//     } = application;
//     const execute = createExecution();
//     const subscribe = createSubscription();

//     const app = express();

//     const httpServer = createServer(app);

//     const server = new ApolloServer({
//       schema,
//       executor: createApolloExecutor(),
//       context: async ({ req }): Promise<Context> => {
//         const token = req.headers.token || '';
//         let decoded: JwtPayload & { id: string };
//         try {
//           decoded = jwt.verify(token as string, config.secret) as JwtPayload & {
//             id: string;
//           };
//         } catch (err) {
//           throw new Error('Unauthorized');
//         }
//         const user = new User(undefined, decoded.id);
//         const userData = await user.getData();

//         if (!userData) {
//           throw new Error('Unauthorized');
//         } else {
//           return { user: userData };
//         }
//       },
//     });

//     SubscriptionServer.create(
//       {
//         schema,
//         execute,
//         subscribe,
//       },
//       {
//         server: httpServer,
//         path: '/',
//       }
//     );

//     await server.start();
//     server.applyMiddleware({
//       app,
//       path: '/',
//       bodyParserConfig: {
//         limit: '10gb',
//       },
//     });

//     const port = 5100;

//     httpServer.listen({ port, host: '0.0.0.0' }, () => {
//       console.log(`Apollo server ready at ${port}`);
//     });
//   } catch (e) {
//     console.trace(e);
//     EventsObserver.listener({ type: 'error', data: e });
//     throw e;
//   }
// };

// export default graphqlServer;

import { ApolloServer } from '@apollo/server';
import { buildSchema } from 'type-graphql';
import {
  GroupUserPrivilegeTableResolver,
  UserResolver,
  UserTableResolver,
} from './resolvers/user.resolver';
import express from 'express';
import cors from 'cors';
import { expressMiddleware } from '@apollo/server/express4';
import { User } from '../../domain/entities/User.entity';
import {
  RepositoryResolver,
  RepositoryTableResolver,
} from './resolvers/repository.resolver';
import { DomainResolver } from './resolvers/domain.resolver';
import { ImageResolver, ImageTableResolver } from './resolvers/image.resolver';
import {
  AppInstanceResolver,
  AppInstanceTableResolver,
} from './resolvers/instance.resolver';
import {
  AppInstanceBackupResolver,
  AppInstanceBackupTableResolver,
} from './resolvers/instance.backup.resolver';
import { NodeResolver, NodeTableResolver } from './resolvers/node.resolver';
import { VolumeResolver } from './resolvers/volume.resolver';
import {
  VolumeBackupResolver,
  VolumeBackupTableResolver,
} from './resolvers/volume.backup.resolver';
import { LogResolver, LogTableResolver } from './resolvers/log.resolver';
import { EventResolver } from './resolvers/event.resolver';
import { AppResolver, AppTableResolver } from './resolvers/app.resolver';
import { DbBackupTableResolver, DbmsResolver, DbmsTableResolver } from './resolvers/dbms.resolver';
import {
  ContainerResolver,
  ContainerTableResolver,
} from './resolvers/container.resolver';
import { MegapolosResolver } from './resolvers/megapolos.resolver';
import { JwtPayload } from 'jsonwebtoken';
import config from '../../domain/config/config';
import jwt from 'jsonwebtoken';
import UserRepo from '../../features/repository/user/user.repository';
import {
  GroupUserPrivilegeResolver,
  GroupUserResolver,
  GroupUserTableResolver,
} from './resolvers/user.group.resolver';
import {
  DbUserResolver,
  DbUserTableResolver,
} from './resolvers/db.user.resolver';
import { DbTableResolver } from './resolvers/dbms.resolver';
import { DbSchemaTableResolver } from './resolvers/dbms.resolver';
import {
  DockerRegistryResolver,
  DockerRegistryTableResolver,
} from './resolvers/docker.registry.resolver';
import { ContainerDbTableResolver } from './resolvers/container.db.resolver';
import { TestCaseResolver } from './resolvers/testCase.resolver';
import {
  AppVersionResolver,
  AppVersionTableResolver,
} from './resolvers/app.version.resolver';
import { SqlEntityManager } from '@mikro-orm/postgresql';
import {
  ConfigurationDbWithUserResolver,
  ConfigurationEnvOptionResolver,
  ConfigurationFieldsResolver,
  ConfigurationPortResolver,
  ConfigurationResolver,
  ConfigurationServiceFieldsResolver,
  ConfigurationVolumeFieldsResolver,
} from './resolvers/configuration.resolver';
import {
  AppExportImportResolver,
  // AppsStoreListResolver,
} from './resolvers/appExportImport.resolver';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { downloadExportedApp } from '../web/exportAppDownload';
import { downloadArtifact } from '../web/artifactDownload';

export class Context {
  constructor(data: {
    req: express.Request;
    res: express.Response;
    user?: User;
    noRightsCheck?: boolean;
  }) {
    this.req = data.req;
    this.res = data.res;
    this.user = data.user;
    this.noRightsCheck = data.noRightsCheck || false;
  }

  req: express.Request;
  res: express.Response;
  user?: User;
  noRightsCheck?: boolean;
  tcem?: SqlEntityManager;
  cloneNoRightsCheck() {
    const ctx = new Context({
      req: this.req,
      res: this.res,
      user: this.user,
      noRightsCheck: true,
    });
    return ctx;
  }

  setTransactionContextEM(tcem: SqlEntityManager) {
    if (this.tcem) {
      throw new Error('Transaction alredy set.');
    }

    this.tcem = tcem;
  }

  reliseTransactionContextEM() {
    this.tcem = null;
  }
}

async function bootstrap() {
  const schema = await buildSchema({
    resolvers: [
      UserResolver,
      UserTableResolver,
      AppResolver,
      AppTableResolver,
      GroupUserPrivilegeTableResolver,
      RepositoryResolver,
      RepositoryTableResolver,
      DomainResolver,
      DockerRegistryResolver,
      DockerRegistryTableResolver,
      ImageResolver,
      ImageTableResolver,
      AppInstanceResolver,
      AppInstanceTableResolver,
      AppInstanceBackupResolver,
      AppInstanceBackupTableResolver,
      LogResolver,
      NodeResolver,
      NodeTableResolver,
      VolumeResolver,
      VolumeBackupResolver,
      VolumeBackupTableResolver,
      EventResolver,
      DbmsResolver,
      DbmsTableResolver,
      ContainerResolver,
      ContainerTableResolver,
      ContainerDbTableResolver,
      MegapolosResolver,
      GroupUserResolver,
      GroupUserTableResolver,
      GroupUserPrivilegeResolver,
      DbUserResolver,
      DbUserTableResolver,
      LogTableResolver,
      DbTableResolver,
      DbSchemaTableResolver,
      TestCaseResolver,
      AppVersionResolver,
      AppVersionTableResolver,
      ConfigurationResolver,
      ConfigurationFieldsResolver,
      ConfigurationServiceFieldsResolver,
      ConfigurationVolumeFieldsResolver,
      ConfigurationPortResolver,
      ConfigurationDbWithUserResolver,
      ConfigurationEnvOptionResolver,
      AppExportImportResolver,
      DbBackupTableResolver,
      // AppsStoreListResolver,
    ],
  });

  const server = new ApolloServer<Context>({
    schema,
    introspection: true,
    csrfPrevention: false,
  });

  await server.start();
  const app = express();

  app.get('/api/exported-app/download/:id', cors(), downloadExportedApp);
  app.get('/api/artifact/download/:id', cors(), downloadArtifact);

  app.use(
    '/',
    cors(),
    (req, res, next) => {
      const contentType = req.headers['content-type'];
      if (contentType && contentType.includes('multipart/form-data')) {
        return graphqlUploadExpress({
          maxFileSize: 1024 * 1024 * 1024 * 10, // 10 GB
          maxFiles: 1000,
        })(req, res, next);
      }
      express.json({ limit: '10tb' })(req, res, next);
    },
    expressMiddleware(server, {
      // context: async ({ req, res }) => {
      //   return { req, res, user: null };
      // },
      context: async ({ req, res }): Promise<Context> => {
        // Проверяем, является ли запрос introspection-запросом
        const isIntrospection =
          req.body.operationName === 'IntrospectionQuery' ||
          req.body.query?.includes('__schema');

        if (config.publicSchema && isIntrospection) {
          return new Context({ req, res, user: undefined }); // Пропускаем авторизацию для introspection
        }

        const token = req.headers.token || '';
        let decoded: JwtPayload & { id: string };
        try {
          decoded = jwt.verify(token as string, config.secret) as JwtPayload & {
            id: string;
          };
        } catch (err) {
          if (config.allowUnauthorized) {
            return new Context({ req, res, user: undefined });
          } else {
            throw new Error('Unauthorized');
          }
        }

        const user = new UserRepo(undefined, decoded.id);
        const userData = await user.getEntity();

        if (!userData) {
          throw new Error('Unauthorized');
        } else {
          return new Context({ user: userData, req, res });
        }
      },
    })
  );

  app.listen(5100, () => {
    console.log('Server is running on port 5100');
  });
}

export default bootstrap;
