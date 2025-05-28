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
import { ContainerRepo } from '../../../features/repository/cantainer/container.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import { ContainerVariable } from '../../../domain/entities/ContainerVariable.entity';
import { Volume } from '../../../domain/entities/Volume.entity';
import { ObjectType } from 'type-graphql';
import VolumeRepo from '../../../features/repository/volume.repository';
import { ContainerEnvOption } from '../../../domain/entities/ContainerEnvOption.entity';
import NodeRepo from '../../../features/repository/megapolos.node.repository';
import { Node } from '../../../domain/entities/Node.entity';
import ImageRepo from '../../../features/repository/image.repository';

@ObjectType()
export class ContainerFileListResult {
  @Field(() => [String])
  files: string[];

  @Field(() => [String])
  directories: string[];
}

@InputType()
class ContainerEnvInput {
  @Field()
  key: string;

  @Field()
  value: string;
}

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

  @Query(() => String)
  async showContainerFile(
    @Arg('id') id: string,
    @Arg('path') path: string,
    @Ctx() ctx: Context
  ): Promise<string> {
    return new ContainerRepo(ctx, id).showFile(path);
  }

  @Query(() => ContainerFileListResult)
  async listContainerFiles(
    @Arg('id') id: string,
    @Arg('path') path: string,
    @Ctx() ctx: Context
  ): Promise<ContainerFileListResult> {
    return new ContainerRepo(ctx, id).listFiles(path);
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
  async updateContainer(
    @Arg('id') id: string,
    @Arg('noRebuild') noRebuild: boolean,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    return false;
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
    @Arg('containerId') containerId: string,
    @Arg('dbId') dbId: string,
    @Arg('dbUserId') dbUserId: string,
    @Arg('name') name: string,
    @Ctx() ctx: Context
  ): Promise<ContainerDb> {
    return new ContainerRepo(ctx, containerId).addDb(dbId, dbUserId, name);
  }

  @Mutation(() => Boolean)
  async removeDbFromContainer(
    @Arg('containerId') containerId: string,
    @Arg('dbId') dbId: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    return new ContainerRepo(ctx, containerId).removeDb(dbId);
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

  @FieldResolver(() => [Volume])
  async volumes(
    @Root() container: Container,
    @Ctx() ctx: Context
  ): Promise<Volume[]> {
    const volumes = await new VolumeRepo(ctx).getVolumesOfContainer(
      container.id
    );
    return volumes.map((v) => v.volume);
  }

  @FieldResolver(() => String, { nullable: true })
  async dockerStatus(
    @Root() container: Container,
    @Ctx() ctx: Context
  ): Promise<string> {
    return new ContainerRepo(ctx, container.id).getDockerStatus();
  }

  @FieldResolver(() => [ContainerEnvOption])
  async envs(
    @Root() container: Container,
    @Ctx() ctx: Context
  ): Promise<ContainerEnvOption[]> {
    return new ContainerRepo(ctx, container.id).getEnvs();
  }

  @FieldResolver(() => Node)
  async node(@Root() container: Container, @Ctx() ctx: Context): Promise<Node> {
    return new NodeRepo(ctx, container.node.id).getEntity();
  }
}
