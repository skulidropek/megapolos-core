import { FieldResolver, Root, Resolver } from 'type-graphql';
import { BaseTableResolver } from '../base.resolver';
import { Container } from '../../../domain/entities/Container.entity';
import { ContainerDb } from '../../../domain/entities/ContainerDb.entity';
import { DbUser } from '../../../domain/entities/DbUser.entity';
import { Db } from '../../../domain/entities/Db.entity';
import { makeEm } from '../../../features/db/mikro-orm';

@Resolver(() => ContainerDb)
export class ContainerDbTableResolver extends BaseTableResolver {
  @FieldResolver(() => [Db], { nullable: false })
  async db(@Root() containerDb: ContainerDb): Promise<Db> {
    return await makeEm().findOneOrFail(Db, { id: containerDb.db.id });
  }

  @FieldResolver(() => DbUser, { nullable: false })
  async dbUser(@Root() containerDb: ContainerDb): Promise<DbUser> {
    return await makeEm().findOneOrFail(DbUser, { id: containerDb.dbUser.id });
  }

  @FieldResolver(() => Container, { nullable: false })
  async container(@Root() containerDb: ContainerDb): Promise<Container> {
    return await makeEm().findOneOrFail(Container, {
      id: containerDb.container.id,
    });
  }
}
