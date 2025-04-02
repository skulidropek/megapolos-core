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
import { UserRepository } from '../../../features/new.repository/user.repository';
import { Context } from '../server';
import { GroupUserPrivilege } from '../../../domain/entities/GroupUserPrivilege.entity';

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
  UserRepository,
  User,
  UserInput,
  UserUpdateInput
) {
  @Query(() => [User])
  async activeUsers(@Ctx() ctx: Context): Promise<User[]> {
    return new UserRepository(ctx).getByFields({ userStatus: 'enable' });
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
}
