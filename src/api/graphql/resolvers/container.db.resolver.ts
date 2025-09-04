import { FieldResolver, Root, Resolver, Ctx } from 'type-graphql';
import { BaseTableResolver } from '../base.resolver';
import { Container } from '../../../domain/entities/Container.entity';
import { ContainerDb } from '../../../domain/entities/ContainerDb.entity';
import { DbUser } from '../../../domain/entities/DbUser.entity';
import { Db } from '../../../domain/entities/Db.entity';
import { ContainerRepo } from '../../../features/repository/cantainer/container.repository';
import { Context } from '../server';
import DbUserRepo from '../../../features/repository/db/db.user.repository';
import DbRepo from '../../../features/repository/db/db.repository';

@Resolver(() => ContainerDb)
export class ContainerDbTableResolver extends BaseTableResolver {
  @FieldResolver(() => [Db], { nullable: false })
  async db(@Root() containerDb: ContainerDb, @Ctx() ctx: Context): Promise<Db> {
    return new DbRepo(ctx, containerDb.db.id).getEntity();
  }

  @FieldResolver(() => DbUser, { nullable: false })
  async dbUser(
    @Root() containerDb: ContainerDb,
    @Ctx() ctx: Context
  ): Promise<DbUser> {
    return new DbUserRepo(ctx, containerDb.dbUser.id).getEntity();
  }

  @FieldResolver(() => Container, { nullable: false })
  async container(
    @Root() containerDb: ContainerDb,
    @Ctx() ctx: Context
  ): Promise<Container> {
    return new ContainerRepo(ctx, containerDb.container.id).getEntity();
  }
}
