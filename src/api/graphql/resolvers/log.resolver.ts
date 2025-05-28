import {
  Mutation,
  Ctx,
  Resolver,
  Arg,
  FieldResolver,
  Root,
} from 'type-graphql';
import { CreateBaseResolver } from '../base.resolver';
import { Log } from '../../../domain/entities/Log.entity';
import { Context } from '../server';
import LogRepo from '../../../features/repository/log.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';

export const LogInput = generateGraphQLInputType(
  Log,
  'LogInput',
  GenerationType.input
);

export const LogUpdateInput = generateGraphQLInputType(
  Log,
  'LogUpdateInput',
  GenerationType.update
);

@Resolver()
export class LogResolver extends CreateBaseResolver(
  'Log',
  LogRepo,
  Log,
  LogInput,
  LogUpdateInput
) {
  @Mutation(() => Boolean)
  async closeLog(@Arg('id') id: string, @Ctx() ctx: Context): Promise<boolean> {
    await new LogRepo(ctx, id).close();
    return true;
  }
}

@Resolver(() => Log)
export class LogTableResolver {
  @FieldResolver(() => String)
  async text(@Root() log: Log, @Ctx() ctx: Context): Promise<string> {
    return new LogRepo(ctx, log.id).getText();
  }
}
