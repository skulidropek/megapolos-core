import { Resolver, Query, Ctx } from 'type-graphql';
import { createBaseResolver } from '../base_resolver';
import { User, UserInput } from '../../../domain/entities/User.entity';
import { Context } from '../server';

@Resolver()
export class UserResolver extends createBaseResolver('User', User, UserInput) {
  @Query(() => [User])
  async activeUsers(@Ctx() ctx: Context): Promise<User[]> {
    return ctx.em.find(User, { restApi: null });
  }
}
