/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import { resolver, UserInput } from '../../types';
import { GroupUserTable, UserTable } from '../models/tables';
import User from '../../classes/User';

const userModule = createModule({
  id: 'user-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type GroupUser {
        id: String
        name: String
      }

      type User {
        id: String
        name: String
        group_user_id: String
        group: GroupUser
        rest_api: String
        user_status: String
        create_date: DateTime
        update_date: DateTime
        disable_date: DateTime
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
        return User.getUsersWithToken();
      }),
      getMe: resolver<void, UserTable>(async (parent, args, context, info) => {
        const results = await new User(context.user.id).getData();
        return results;
      }),
    },
    Mutation: {
      addUser: resolver<{ input: UserInput }, boolean>(async (parent, args, context, info) => {
        await User.createUser({ name: args.input.name, groupUserId: 'name' });
        return true;
      }),
    },
    User: {
      group: resolver<UserTable, GroupUserTable>(async (parent, args, context, info) => {
        return new User(parent.id).getGroup();
      }),
    },
  },
});

export default userModule;