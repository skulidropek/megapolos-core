import { Resolver, Query, Ctx, FieldResolver, Root, Info } from 'type-graphql';
import { CreateBaseResolver, BaseTableResolver } from '../base.resolver';
import { User } from '../../../domain/entities/User.entity';
import { GroupUser } from '../../../domain/entities/GroupUser.entity';
import { GraphQLResolveInfo } from 'graphql';
import { makeEm } from '../../../features/db/mikro-orm';

@Resolver()
export class UserResolver extends CreateBaseResolver('User', User) {
  @Query(() => [User])
  async activeUsers(): Promise<User[]> {
    return makeEm().find(User, { restApi: null });
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
}
