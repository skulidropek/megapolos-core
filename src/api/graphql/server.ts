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
} from './new.resolvers/user.resolver';
import express from 'express';
import cors from 'cors';
import { expressMiddleware } from '@apollo/server/express4';
import { User } from '../../domain/entities/User.entity';
import {
  RepositoryResolver,
  RepositoryTableResolver,
} from './new.resolvers/repository.resolver';
import { DomainResolver } from './new.resolvers/domain.resolver';
import {
  ImageResolver,
  ImageTableResolver,
} from './new.resolvers/image.resolver';
import {
  AppInstanceResolver,
  AppInstanceTableResolver,
} from './new.resolvers/instance.resolver';
import { NodeResolver, NodeTableResolver } from './new.resolvers/node.resolver';
import { VolumeResolver } from './new.resolvers/volume.resolver';
import { LogResolver } from './new.resolvers/log.resolver';
import { EventResolver } from './new.resolvers/event.resolver';
import { AppResolver, AppTableResolver } from './new.resolvers/app.resolver';
import { DbmsResolver, DbmsTableResolver } from './new.resolvers/dbms.resolver';
import {
  ContainerResolver,
  ContainerTableResolver,
} from './new.resolvers/container.resolver';
import { MegapolosResolver } from './new.resolvers/megapolos.resolver';

export interface Context {
  req: express.Request;
  res: express.Response;
  user?: User;
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
      ImageResolver,
      ImageTableResolver,
      AppInstanceResolver,
      AppInstanceTableResolver,
      LogResolver,
      NodeResolver,
      NodeTableResolver,
      VolumeResolver,
      EventResolver,
      DbmsResolver,
      DbmsTableResolver,
      ContainerResolver,
      ContainerTableResolver,
      MegapolosResolver,
    ],
  });

  const server = new ApolloServer<Context>({
    schema,
    introspection: true,
  });

  await server.start();
  const app = express();

  app.use(express.json());
  app.use(
    '/graphql',
    cors(),
    expressMiddleware(server, {
      context: async ({ req, res }) => ({
        req,
        res,
      }),
    })
  );
  app.listen(5100, () => {
    console.log('Server is running on port 5100');
  });
}

export default bootstrap;
