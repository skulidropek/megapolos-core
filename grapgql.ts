import jwt, { JwtPayload } from 'jsonwebtoken';
import { ApolloServer } from 'apollo-server';
import { createApplication } from 'graphql-modules';
import config from './config/config.json';
import UserModel from './modules/models/user.model';
import { Context } from './types';
import userModule from './modules/resolvers/user.resolver';
import nodeModule from './modules/resolvers/node.resolver';
import appModule from './modules/resolvers/app.resolver';
import deviceModule from './modules/resolvers/device.resolver';

const graphqlServer = async () => {
  try {
    const application = createApplication({
      modules: [userModule, nodeModule, appModule, deviceModule],
    });
   
    const executor = application.createApolloExecutor();
    const schema = application.schema;
 
    const server = new ApolloServer({ schema, executor,
      context: async ({ req }):Promise<Context> => {
        const token = req.headers.token || '';
        let decoded: JwtPayload & { id: string };
        try {
          decoded = jwt.verify(token as string, config.secret) as JwtPayload & { id: string };
        } catch (err) {
          throw new Error('Unauthorized');
        }
        const user = await UserModel.getUserById(decoded.id);

        if (!user) {
          throw new Error('Unauthorized');
        } else {
          return { user };
        }
      },
    });

    const port = 5100;
 
    server.listen({ port }).then(({ url }) => {
      console.log(`Apollo server ready at ${port}`);
    });

  } catch (e) {
    console.error(e);
    throw e;
  }
};

export default graphqlServer;