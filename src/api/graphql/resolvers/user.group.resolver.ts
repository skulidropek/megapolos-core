import {
  Query,
  Mutation,
  Ctx,
  FieldResolver,
  Root,
  Resolver,
  Arg,
} from 'type-graphql';
import { CreateBaseResolver, BaseTableResolver } from '../base.resolver';
import { GroupUser } from '../../../domain/entities/GroupUser.entity';
import { User } from '../../../domain/entities/User.entity';
import { GroupUserPrivilege } from '../../../domain/entities/GroupUserPrivilege.entity';
import { Context } from '../server';
import UserGroupRepo from '../../../features/repository/user/user.group.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import { makeEm } from '../../../features/db/mikro-orm';
import UserGroupPrivilegeRepo from '../../../features/repository/user/user.group.privilege.repository';
import {
  resources,
  ResourceType,
} from '../../../features/rights/resources.list';

// Генерируем Input типы
export const GroupUserInput = generateGraphQLInputType(
  GroupUser,
  'GroupUserInput',
  GenerationType.input
);

export const GroupUserUpdateInput = generateGraphQLInputType(
  GroupUser,
  'GroupUserUpdateInput',
  GenerationType.update
);

@Resolver()
export class GroupUserResolver extends CreateBaseResolver(
  'Group',
  UserGroupRepo,
  GroupUser,
  GroupUserInput,
  GroupUserUpdateInput
) {
  @Query(() => [GroupUserPrivilege])
  async getGroupUserPrivilegesByObjectId(
    @Arg('objectId') objectId: string,
    @Ctx() ctx: Context
  ): Promise<GroupUserPrivilege[]> {
    return await new UserGroupPrivilegeRepo(ctx).getPrivilegesByObjectId(
      objectId
    );
  }

  @Query(() => [String])
  async getAllPossibleActions(
    @Arg('objectName', () => ResourceType) objectName: ResourceType
  ): Promise<string[]> {
    return Object.values(resources[objectName].actions);
  }

  @Mutation(() => Boolean)
  async addUserToGroup(
    @Arg('userId') userId: string,
    @Arg('groupId') groupId: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new UserGroupRepo(ctx, groupId).addUser(userId);
    return true;
  }

  @Mutation(() => Boolean)
  async removeUserFromGroup(
    @Arg('userId') userId: string,
    @Arg('groupId') groupId: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new UserGroupRepo(ctx, groupId).removeUser(userId);
    return true;
  }

  @Mutation(() => Boolean)
  async grantPrivilege(
    @Arg('groupId') groupId: string,
    @Arg('objectName') objectName: string,
    @Arg('objectId') objectId: string,
    @Arg('action') action: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new UserGroupPrivilegeRepo(ctx).pushForResource(
      groupId,
      objectName,
      objectId,
      action
    );

    return true;
  }

  @Mutation(() => Boolean)
  async revokePrivilege(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new UserGroupPrivilegeRepo(ctx).revoke(id);
    return true;
  }
}

@Resolver(() => GroupUser)
export class GroupUserTableResolver extends BaseTableResolver {
  @FieldResolver(() => [User])
  async users(@Root() group: GroupUser): Promise<User[]> {
    return await makeEm().find(User, {
      groups: { id: group.id },
    });
  }

  @FieldResolver(() => [GroupUserPrivilege])
  async privileges(@Root() group: GroupUser): Promise<GroupUserPrivilege[]> {
    return await makeEm().find(GroupUserPrivilege, {
      groupUser: { id: group.id },
    });
  }
}

@Resolver(() => GroupUserPrivilege)
export class GroupUserPrivilegeResolver extends BaseTableResolver {
  @FieldResolver(() => GroupUser)
  async group(@Root() privilege: GroupUserPrivilege): Promise<GroupUser> {
    return await makeEm().findOneOrFail(GroupUser, {
      id: privilege.groupUser.id,
    });
  }
}
