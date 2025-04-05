import {
  Query,
  Mutation,
  Ctx,
  FieldResolver,
  Root,
  Resolver,
  Arg,
  InputType,
  Field,
} from 'type-graphql';
import { CreateBaseResolver, BaseTableResolver } from '../base.resolver';
import { Container } from '../../../domain/entities/Container.entity';
import { Image } from '../../../domain/entities/Image.entity';
import { Domain } from '../../../domain/entities/Domain.entity';
import { ContainerDb } from '../../../domain/entities/ContainerDb.entity';
import { Context } from '../server';
import { ContainerRepo } from '../../../features/new.repository/cantainer/container.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import { ContainerVariable } from '../../../domain/entities/ContainerVariable.entity';

@InputType()
class ContainerEnvInput {
  @Field()
  key: string;

  @Field()
  value: string;
}

export const ContainerDbInput = generateGraphQLInputType(
  ContainerDb,
  'ContainerDbInput',
  GenerationType.input
);

export const ContainerVariableInput = generateGraphQLInputType(
  ContainerVariable,
  'ContainerVariableInput',
  GenerationType.input
);

export const ContainerInput = generateGraphQLInputType(
  Container,
  'ContainerInput',
  GenerationType.input
);

export const ContainerUpdateInput = generateGraphQLInputType(
  Container,
  'ContainerUpdateInput',
  GenerationType.update
);

@Resolver()
export class ContainerResolver extends CreateBaseResolver(
  'Container',
  ContainerRepo,
  Container,
  ContainerInput,
  ContainerUpdateInput
) {
  @Query(() => String)
  async getContainerLog(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<string> {
    return new ContainerRepo(ctx, id).getDockerLog();
  }

  @Mutation(() => Boolean)
  async startContainer(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new ContainerRepo(ctx, id).start();
    return true;
  }

  @Mutation(() => Boolean)
  async stopContainer(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new ContainerRepo(ctx, id).stop();
    return true;
  }

  @Mutation(() => Boolean)
  async changeContainerEnvs(
    @Arg('id') id: string,
    @Arg('envs', () => [ContainerEnvInput])
    envs: { key: string; value: string }[],
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new ContainerRepo(ctx, id).changeEnvs(envs);
    return true;
  }

  @Mutation(() => Boolean)
  async changeContainerVariables(
    @Arg('id') id: string,
    @Arg('variables', () => [ContainerVariableInput])
    variables: (typeof ContainerVariableInput)[],
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new ContainerRepo(ctx, id).changeVariables(variables);
    return true;
  }

  @Mutation(() => ContainerDb)
  async addDbToContainer(
    @Arg('input', () => ContainerDbInput) input: ContainerDb,
    @Ctx() ctx: Context
  ): Promise<ContainerDb> {
    return new ContainerRepo(ctx).addDb(
      input.db.id,
      input.dbUser.id,
      input.name
    );
  }
}

@Resolver(() => Container)
export class ContainerTableResolver extends BaseTableResolver {
  @FieldResolver(() => Image)
  async image(
    @Root() container: Container,
    @Ctx() ctx: Context
  ): Promise<Image> {
    return (await new ContainerRepo(ctx, container.id).getImage()).getEntity();
  }

  @FieldResolver(() => Domain, { nullable: true })
  async domain(
    @Root() container: Container,
    @Ctx() ctx: Context
  ): Promise<Domain | null> {
    return new ContainerRepo(ctx, container.id).getDomain();
  }

  @FieldResolver(() => [ContainerDb])
  async dbs(
    @Root() container: Container,
    @Ctx() ctx: Context
  ): Promise<ContainerDb[]> {
    return new ContainerRepo(ctx, container.id).getDbs();
  }

  @FieldResolver(() => String)
  async runtimeVariables(
    @Root() container: Container,
    @Ctx() ctx: Context
  ): Promise<string> {
    const variables = await new ContainerRepo(
      ctx,
      container.id
    ).getRuntimeVariables();
    return JSON.stringify(variables, null, 2);
  }
}
