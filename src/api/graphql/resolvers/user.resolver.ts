import { Query, Ctx, FieldResolver, Root, Info, Resolver } from 'type-graphql';
import { CreateBaseResolver, BaseTableResolver } from '../base.resolver';
import { User } from '../../../domain/entities/User.entity';
import { GroupUser } from '../../../domain/entities/GroupUser.entity';
import { GraphQLResolveInfo } from 'graphql';
import { makeEm } from '../../../features/db/mikro-orm';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import { Context } from '../server';
import { GroupUserPrivilege } from '../../../domain/entities/GroupUserPrivilege.entity';
import UserRepo from '../../../features/repository/user/user.repository';

export const UserInput = generateGraphQLInputType(
  User,
  `UserInput`,
  GenerationType.input
);

export const UserUpdateInput = generateGraphQLInputType(
  User,
  `UserUpdateInput`,
  GenerationType.update
);

@Resolver()
export class UserResolver extends CreateBaseResolver(
  'User',
  UserRepo,
  User,
  UserInput,
  UserUpdateInput
) {
  @Query(() => [User])
  async activeUsers(@Ctx() ctx: Context): Promise<User[]> {
    return new UserRepo(ctx).getByFields({ userStatus: 'enable' });
  }

  @Query(() => User)
  async getMe(@Ctx() ctx: Context): Promise<User> {
    return ctx.user;
  }
}

@Resolver(() => User)
export class UserTableResolver extends BaseTableResolver {
  @FieldResolver(() => GroupUser, { nullable: false })
  async groupUser(
    @Root() user: User,
    @Info() info: GraphQLResolveInfo
  ): Promise<GroupUser> {
    return this.returnOnlyIdIfNeeded(info, user.groupUser.id, async () => {
      return await makeEm().findOneOrFail(GroupUser, { id: user.groupUser.id });
    });
  }

  @FieldResolver(() => [GroupUser], { nullable: false })
  async groups(@Root() user: User): Promise<GroupUser[]> {
    return await makeEm().find(GroupUser, {
      users: { id: user.id },
    });
  }

  @FieldResolver(() => String, { nullable: true })
  async token(@Ctx() ctx: Context, @Root() user: User): Promise<string | null> {
    return ctx.req.headers.token as string;
  }
}

@Resolver(() => GroupUser)
export class GroupUserPrivilegeTableResolver extends BaseTableResolver {
  @FieldResolver(() => [GroupUserPrivilege], { nullable: false })
  async privileges(
    @Root() groupUser: GroupUser
  ): Promise<GroupUserPrivilege[]> {
    return await makeEm().find(GroupUserPrivilege, {
      groupUser: groupUser.id,
    });
  }

  @FieldResolver(() => [User], { nullable: false })
  async users(@Root() groupUser: GroupUser): Promise<User[]> {
    return await makeEm().find(User, {
      groups: { id: groupUser.id },
    });
  }
}
