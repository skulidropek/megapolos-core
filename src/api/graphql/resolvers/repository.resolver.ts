import {
  Query,
  Ctx,
  Root,
  Resolver,
  Mutation,
  Arg,
  FieldResolver,
  Info,
} from 'type-graphql';
import { BaseTableResolver, CreateBaseResolver } from '../base.resolver';
import {
  LogCommit,
  Repository,
  RepositoryFiles,
} from '../../../domain/entities/Repository.entity';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import RepositoryRepo from '../../../features/repository/repository.repository';
import { Context } from '../server';
import { GraphQLResolveInfo } from 'graphql';
import { App } from '../../../domain/entities/App.entity';
import { makeEm } from '../../../features/db/mikro-orm';

export const RepositoryInput = generateGraphQLInputType(
  Repository,
  `RepositoryInput`,
  GenerationType.input
);

export const RepositoryUpdateInput = generateGraphQLInputType(
  Repository,
  `RepositoryUpdateInput`,
  GenerationType.update
);

@Resolver()
export class RepositoryResolver extends CreateBaseResolver(
  'Repository',
  RepositoryRepo,
  Repository,
  RepositoryInput,
  RepositoryUpdateInput
) {
  @Query(() => [String])
  async getBranches(
    @Ctx() ctx: Context,
    @Arg('id') id: string
  ): Promise<string[]> {
    return new RepositoryRepo(ctx, id).getBranches();
  }

  @Query(() => String)
  async showRepositoryFile(
    @Ctx() ctx: Context,
    @Arg('id') id: string,
    @Arg('branch') branch: string,
    @Arg('path') path: string
  ): Promise<string> {
    return new RepositoryRepo(ctx, id).showFile(branch, path);
  }

  @Query(() => RepositoryFiles)
  async listRepositoryFiles(
    @Ctx() ctx: Context,
    @Arg('id') id: string,
    @Arg('branch') branch: string,
    @Arg('path', { defaultValue: '' }) path: string
  ): Promise<RepositoryFiles> {
    return new RepositoryRepo(ctx, id).listFiles(branch, path);
  }

  @Query(() => LogCommit, { nullable: true })
  async getLastCommitOfBranch(
    @Ctx() ctx: Context,
    @Arg('id') id: string,
    @Arg('branch') branch: string
  ): Promise<LogCommit | null> {
    return new RepositoryRepo(ctx, id).getLastCommitOfBranch(branch);
  }

  @Mutation(() => Boolean)
  async fetchRepository(
    @Ctx() ctx: Context,
    @Arg('id') id: string
  ): Promise<boolean> {
    await new RepositoryRepo(ctx, id).fetch();
    return true;
  }

  @Mutation(() => Boolean)
  async push(
    @Ctx() ctx: Context,
    @Arg('id') id: string,
    @Arg('branchFrom') branchFrom: string,
    @Arg('branchTo') branchTo: string
  ): Promise<boolean> {
    await new RepositoryRepo(ctx, id).push(branchFrom, branchTo);
    return true;
  }

  @Mutation(() => Boolean)
  async copyBranchTo(
    @Ctx() ctx: Context,
    @Arg('id') id: string,
    @Arg('path') path: string,
    @Arg('branch') branch: string
  ): Promise<boolean> {
    await new RepositoryRepo(ctx, id).copyBranchTo(path, branch);
    return true;
  }
}

@Resolver(() => Repository)
export class RepositoryTableResolver extends BaseTableResolver {
  @FieldResolver(() => App, { nullable: true })
  async app(
    @Root() repository: Repository,
    @Info() info: GraphQLResolveInfo
  ): Promise<App | null> {
    if (!repository.app) return null;

    return this.returnOnlyIdIfNeeded(info, repository.app.id, async () => {
      return await makeEm().findOneOrFail(App, { id: repository.app.id });
    });
  }

  @FieldResolver(() => [String])
  async branches(
    @Root() repository: Repository,
    @Ctx() ctx: Context
  ): Promise<string[]> {
    return new RepositoryRepo(ctx, repository.id).getBranches();
  }
}
