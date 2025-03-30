/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import jwt, { JwtPayload } from 'jsonwebtoken';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createApplication } from 'graphql-modules';
import userModule from './resolvers/user.resolver';
import nodeModule from './resolvers/node.resolver';
import appModule from './resolvers/app.resolver';
import eventModule from './resolvers/event.resolver';
import volumeModule from './resolvers/volume.resolver';
import User from '../repository/user/User';
import EventsObserver from './events/eventsObserver';
import repositoryModule from './resolvers/repository.resolver';
import instanceModule from './resolvers/instance.resolver';
import containerModule from './resolvers/container.resolver';
import imageModule from './resolvers/image.resolver';
import domainModule from './resolvers/domain.resolver';
import dbmsModule from './resolvers/dbms.resolver';
import logModule from './resolvers/log.resolver';
import megapolosModule from './resolvers/megapolos.resolver';
import { Context } from '../../domain/types';
import config from '../../domain/config/config';

const graphqlServer = async () => {
  try {
    const application = createApplication({
      modules: [
        userModule, nodeModule, appModule, 
        // deviceModule, 
        eventModule, volumeModule, 
        // resourceModule,
        repositoryModule,
        instanceModule,
        containerModule,
        imageModule,
        domainModule,
        dbmsModule,
        logModule,
        megapolosModule,
      ],
    });
   
    const { schema, createExecution, createSubscription, createApolloExecutor } = application;
    const execute = createExecution();
    const subscribe = createSubscription();

    const app = express();
 
    const httpServer = createServer(app);
 
    const server = new ApolloServer({ schema,
      executor: createApolloExecutor(),
      context: async ({ req }):Promise<Context> => {
        const token = req.headers.token || '';
        let decoded: JwtPayload & { id: string };
        try {
          decoded = jwt.verify(token as string, config.secret) as JwtPayload & { id: string };
        } catch (err) {
          throw new Error('Unauthorized');
        }
        const user = new User(undefined, decoded.id);
        const userData = await user.getData();

        if (!userData) {
          throw new Error('Unauthorized');
        } else {
          return { user: userData };
        }
      },
    });


    SubscriptionServer.create(
      {
        schema,
        execute,
        subscribe,
      },
      {
        server: httpServer,
        path: '/',
      },
    );

    await server.start();
    server.applyMiddleware({ app, path: '/', bodyParserConfig: {
      limit: '10gb',
    } });

    const port = 5100;
 
    httpServer.listen({ port,
      host: '0.0.0.0',
    }, () => {
      console.log(`Apollo server ready at ${port}`);
    });

  } catch (e) {
    console.trace(e);
    EventsObserver.listener({ type: 'error', data: e });
    throw e;
  }
};

export default graphqlServer;