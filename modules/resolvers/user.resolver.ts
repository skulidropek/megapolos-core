import { createModule, gql } from 'graphql-modules';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../../config/config.json';
import { resolver, UserInput } from '../../types';
import { UserTable } from '../models/tables';
import UserModel from '../models/user.model';
import EventsObserver from '../events/eventsObserver';

const userModule = createModule({
  id: 'user-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type User {
        id: String
        name: String
        group_user_id: String
        rest_api: String
        user_status: String
        create_date: String
        update_date: String
        disable_date: String
        os_user_id: String
        token: String
      }

      input UserInput {
        name: String
      }

      type Query {
        getUsers: [User]
        getMe: User
      }

      type Mutation {
        addUser(input: UserInput!): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getUsers: resolver<void, (UserTable & { token?: String })[]>(async (parent, args, context, info) => {
        const results:(UserTable & { token?: String })[] = await UserModel.getUsers();
        results.forEach((result) => {
          result.token = jwt.sign({ id: result.id }, config.secret);
        });
        return results;
      }),
      getMe: resolver<void, UserTable>(async (parent, args, context, info) => {
        const results = await UserModel.getUserById(context.user.id);
        return results;
      }),
    },
    Mutation: {
      addUser: resolver<{ input: UserInput }, boolean>(async (parent, args, context, info) => {
        const id = uuidv4();
        await UserModel.createUser({ id, name: args.input.name, groupUserId: 'name' });
        EventsObserver.listener({ type: 'addUser', data: args });
        return true;
      }),
    },
  },
});

export default userModule;