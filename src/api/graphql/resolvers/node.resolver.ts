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
import { Node } from '../../../domain/entities/Node.entity';
import { Container } from '../../../domain/entities/Container.entity';
import { Context } from '../server';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import NodeRepo from '../../../features/repository/megapolos.node.repository';

export const NodeInput = generateGraphQLInputType(
  Node,
  'NodeInput',
  GenerationType.input
);

export const NodeUpdateInput = generateGraphQLInputType(
  Node,
  'NodeUpdateInput',
  GenerationType.update
);

@Resolver()
export class NodeResolver extends CreateBaseResolver(
  'Node',
  NodeRepo,
  Node,
  NodeInput,
  NodeUpdateInput
) {
  @Query(() => Node)
  @Mutation(() => Boolean)
  async updateNode(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new NodeRepo(ctx, id).updateNode();
    return true;
  }

  @Mutation(() => Boolean)
  async updateNodes(
    @Arg('nodeIds', () => [String]) nodeIds: string[],
    @Ctx() ctx: Context
  ): Promise<boolean> {
    for (const nodeId of nodeIds) {
      await new NodeRepo(ctx, nodeId).updateNode();
    }
    return true;
  }

  @Mutation(() => Boolean)
  async initNode(@Arg('id') id: string, @Ctx() ctx: Context): Promise<boolean> {
    await new NodeRepo(ctx, id).init();
    return true;
  }

  @Mutation(() => Boolean)
  async prepareNodeForCore(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new NodeRepo(ctx, id).prepareForCore();
    return true;
  }

  @Mutation(() => Boolean)
  async installRegistryToNode(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new NodeRepo(ctx, id).installRegistry();
    return true;
  }
}

@Resolver(() => Node)
export class NodeTableResolver extends BaseTableResolver {
  @FieldResolver(() => [Container])
  async containers(
    @Root() node: Node,
    @Ctx() ctx: Context
  ): Promise<Container[]> {
    return new NodeRepo(ctx, node.id).getContainers();
  }

  @FieldResolver(() => [String])
  async runningContainers(
    @Root() node: Node,
    @Ctx() ctx: Context
  ): Promise<string[]> {
    return new NodeRepo(ctx, node.id).getDockerContainers();
  }

  @FieldResolver(() => String)
  async ip(@Root() node: Node, @Ctx() ctx: Context): Promise<string> {
    return new NodeRepo(ctx, node.id).getIp();
  }
}
