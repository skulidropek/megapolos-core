import { Resolver, FieldResolver, Root } from 'type-graphql';
import { DbUser } from '../../../domain/entities/DbUser.entity';
import { Db } from '../../../domain/entities/Db.entity';
import { BaseTableResolver, CreateBaseResolver } from '../base.resolver';
import { makeEm } from '../../../features/db/mikro-orm';
import DbUserRepo from '../../../features/repository/db/db.user.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import { Dbms } from '../../../domain/entities/Dbms.entity';

export const DbUserInput = generateGraphQLInputType(
  DbUser,
  'DbUserInput',
  GenerationType.input
);

export const DbUserUpdateInput = generateGraphQLInputType(
  DbUser,
  'DbUserUpdateInput',
  GenerationType.update
);

@Resolver()
export class DbUserResolver extends CreateBaseResolver(
  'DbUser',
  DbUserRepo,
  DbUser,
  DbUserInput,
  DbUserUpdateInput
) {}

@Resolver(() => DbUser)
export class DbUserTableResolver extends BaseTableResolver {
  @FieldResolver(() => [Db])
  async dbs(@Root() dbUser: DbUser): Promise<Db[]> {
    return await makeEm().find(Db, {
      users: { id: dbUser.id },
    });
  }

  @FieldResolver(() => Dbms)
  async dbms(@Root() dbUser: DbUser): Promise<Dbms> {
    return await makeEm().findOneOrFail(Dbms, { id: dbUser.dbms.id });
  }

  @FieldResolver(() => [Db])
  async ownedDbs(@Root() owner: DbUser): Promise<Db[]> {
    return await makeEm().find(Db, {
      owner: owner,
    });
  }
}
