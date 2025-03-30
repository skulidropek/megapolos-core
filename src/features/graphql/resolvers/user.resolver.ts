/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import User from '../../repository/user/User';
import UserGroup from '../../repository/user/UserGroup';
import UserGroupPrivilege from '../../repository/user/UserGroupPrivilege';
import { resolver, UserInput } from '../../../domain/types';
import {
  GroupUserPrivilegeTable,
  GroupUserTable,
  UserTable,
} from '../../db/tables';
import { resources } from '../../rights/resources_list';

interface PrivilegeInput {
  role_id: string;
  resource_type: string;
  resource_id: string;
  action: string;
}

interface GroupUserWithPrivilege {
  id: string;
  name: string;
  privileges: GroupUserPrivilegeTable[];
}

interface AddUserToGroupInput {
  user_id: string;
  group_id: string;
}

const userModule = createModule({
  id: 'user-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type GroupUser {
        id: String
        name: String
      }
      
      type GroupUserWithPrivilege {
        id: String
        name: String
        privileges: [GroupUserPrivilege]
      }

      type GroupUserPrivilege {
        id: String
        group_user_id: String
        object_name: String
        object_id: String
        action: String
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

      input PrivilegeInput {
        role_id: String
        resource_type: String
        resource_id: String
        action: String
      }

      input AddUserToGroupInput {
        user_id: String!
        group_id: String!
      }

      type Query {
        getUsers: [User]
        getMe: User
        getAllUserGroups: [GroupUser]
        getGroupUserPrivilege(group_user_id: String!): [GroupUserPrivilege]
        getAllUserGroupsWithPrivileges: [GroupUserWithPrivilege]
        getPrivilegeActions(resource_type: String!): [String]
      }

      type Mutation {
        addUser(input: UserInput!): Boolean
        grantPrivilege(input: PrivilegeInput!): Boolean
        revokePrivilege(id: String!): Boolean
        addUserToGroup(input: AddUserToGroupInput!): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getUsers: resolver<void, (UserTable & { token?: String })[]>(
        async (parent, args, context) => {
          return new User(context).getUsersWithToken();
        },
      ),
      getMe: resolver<void, UserTable>(async (parent, args, context) => {
        const results = await new User(context, context.user.id).getData();
        return results;
      }),
      getAllUserGroups: resolver<void, GroupUserTable[]>(
        async (parent, args, context) => {
          return new UserGroup(context).getAll();
        },
      ),
      getGroupUserPrivilege: resolver<
      { group_user_id: string },
      GroupUserPrivilegeTable[]
      >(async (parent, args, context) => {
        return new UserGroupPrivilege(context).getByFields({
          group_user_id: args.group_user_id,
        });
      }),
      getAllUserGroupsWithPrivileges: resolver<void, GroupUserWithPrivilege[]>(
        async (parent, args, context) => {
          const groups = await new UserGroup(context).getAll();
          const privileges = await new UserGroupPrivilege(context).getAll();
          return groups.map((group) => ({
            id: group.id,
            name: group.name,
            privileges: privileges.filter((p) => p.group_user_id === group.id),
          }));
        },
      ),
      getPrivilegeActions: resolver<{ resource_type: string }, string[]>(
        async (parent, args) => {
          const resource = resources[args.resource_type];
          if (!resource) {
            throw new Error('Resource type not found');
          }
          return Object.values(resource.actions);
        },
      ),
    },
    Mutation: {
      addUser: resolver<{ input: UserInput }, boolean>(
        async (parent, args, context) => {
          await new User(context).create({ name: args.input.name });
          return true;
        },
      ),
      grantPrivilege: resolver<{ input: PrivilegeInput }, boolean>(
        async (parent, args, context) => {
          await new UserGroupPrivilege(context).pushForResource(
            args.input.role_id,
            args.input.resource_type,
            args.input.resource_id,
            args.input.action,
          );
          return true;
        },
      ),
      revokePrivilege: resolver<{ id: string }, boolean>(
        async (parent, args, context) => {
          return new UserGroupPrivilege(context).revoke(args.id);
        },
      ),
      addUserToGroup: resolver<{ input: AddUserToGroupInput }, boolean>(
        async (parent, args, context) => {
          return new User(context, args.input.user_id).addUserToGroup(args.input.group_id);
        },
      ), 
    },
    User: {
      group: resolver<UserTable, GroupUserTable>(
        async (parent, args, context) => {
          return new User(context, parent.id).getGroup();
        },
      ),
    },
  },
});

export default userModule;
