import {
  Query,
  Mutation,
  Ctx,
  FieldResolver,
  Root,
  Resolver,
  Arg,
} from 'type-graphql';
import { BaseTableResolver, CreateBaseResolver } from '../base.resolver';
import { makeEm } from '../../../features/db/mikro-orm';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import { DockerRegistry } from '../../../domain/entities/DockerRegistry.entity';
import DockerRegistryRepo from '../../../features/repository/docker.registry.repository';
import { Context } from '../server';

export const DockerRegistryInput = generateGraphQLInputType(
  DockerRegistry,
  'DockerRegistryInput',
  GenerationType.input
);

export const DockerRegistryUpdateInput = generateGraphQLInputType(
  DockerRegistry,
  'DockerRegistryUpdateInput',
  GenerationType.update
);

@Resolver()
export class DockerRegistryResolver extends CreateBaseResolver(
  'DockerRegistry',
  DockerRegistryRepo,
  DockerRegistry,
  DockerRegistryInput,
  DockerRegistryUpdateInput
) {
  @Mutation(() => Boolean)
  async setDockerRegistryAsDefault(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new DockerRegistryRepo(ctx, id).setAsDefault();
    return true;
  }
}

@Resolver(() => DockerRegistry)
export class DockerRegistryTableResolver extends BaseTableResolver {}
