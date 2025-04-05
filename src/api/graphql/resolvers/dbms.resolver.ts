import {
  Query,
  Mutation,
  Ctx,
  FieldResolver,
  Root,
  Resolver,
  Arg,
  ObjectType,
  Field,
  InputType,
} from 'type-graphql';
import { BaseTableResolver } from '../base.resolver';
import { Dbms } from '../../../domain/entities/Dbms.entity';
import { Db } from '../../../domain/entities/Db.entity';
import { DbUser } from '../../../domain/entities/DbUser.entity';
import { DbBackup } from '../../../domain/entities/DbBackup.entity';
import { DbSchema } from '../../../domain/entities/DbSchema.entity';
import { Context } from '../server';
import DbmsRepo from '../../../features/repository/dbms/dbms.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import BaseDbmsRepo from '../../../features/repository/dbms/base.dbms.repository';
import DbBackupRepo from '../../../features/repository/db/db.backup.repository';
import { RequiredEntityData } from '@mikro-orm/core';

@InputType()
class DbInput {
  @Field()
  name: string;

  @Field()
  dbmsId: string;
}

@InputType()
class DbUserInput {
  @Field()
  name: string;

  @Field()
  dbmsId: string;

  @Field({ nullable: true })
  password?: string;
}

@ObjectType()
class MassDbQueryResult {
  @Field()
  dbName: string;

  @Field()
  result: string;

  @Field({ nullable: true })
  error?: string;
}

export const DbmsInput = generateGraphQLInputType(
  Dbms,
  'DbmsInput',
  GenerationType.input
);

export const DbmsUpdateInput = generateGraphQLInputType(
  Dbms,
  'DbmsUpdateInput',
  GenerationType.update
);

@Resolver()
export class DbmsResolver {
  @Query(() => [Dbms])
  async getDbmss(@Ctx() ctx: Context): Promise<Dbms[]> {
    return new BaseDbmsRepo(ctx).getAll();
  }

  @Query(() => Dbms)
  async getDbms(@Arg('id') id: string): Promise<Dbms> {
    return (await DbmsRepo.getById(id)).getEntity();
  }

  @Query(() => [String])
  async compareDbs(
    @Arg('dbId1') dbId1: string,
    @Arg('dbId2') dbId2: string
  ): Promise<string[]> {
    return DbmsRepo.compareDbs(dbId1, dbId2);
  }

  @Query(() => [String])
  async compareSchemas(
    @Arg('schema1id') schema1id: string,
    @Arg('schema2id') schema2id: string
  ): Promise<string[]> {
    return DbmsRepo.compareSchemas(schema1id, schema2id);
  }

  @Query(() => [String])
  async compareDbSchema(
    @Arg('dbid') dbid: string,
    @Arg('schemaid') schemaid: string
  ): Promise<string[]> {
    return DbmsRepo.compareDbSchema(dbid, schemaid);
  }

  @Query(() => String)
  async downloadBackupText(
    @Arg('backupId') backupId: string,
    @Ctx() ctx: Context
  ): Promise<string> {
    const dbBackup = await new DbBackupRepo(ctx, backupId).getEntity();
    return (await DbmsRepo.getByType(dbBackup.type)).downloadBackupText(
      backupId
    );
  }

  @Mutation(() => Dbms)
  async createDbms(
    @Arg('input', () => DbmsInput) input: RequiredEntityData<Dbms>
  ): Promise<Dbms> {
    return (await DbmsRepo.getByType(input.type)).create(input);
  }

  @Mutation(() => Boolean)
  async editDbms(
    @Arg('id') id: string,
    @Arg('input', () => DbmsUpdateInput) input: RequiredEntityData<Dbms>
  ): Promise<boolean> {
    return (await DbmsRepo.getById(id)).update(input);
  }

  @Mutation(() => Boolean)
  async deleteDbms(@Arg('id') id: string): Promise<boolean> {
    await (await DbmsRepo.getById(id)).delete();
    return true;
  }

  @Mutation(() => Db)
  async createDb(
    @Arg('input', () => DbInput) input: DbInput,
    @Arg('withoutChange', { nullable: true }) withoutChange: boolean
  ): Promise<Db> {
    return (await DbmsRepo.getById(input.dbmsId)).createDb(
      input,
      withoutChange
    );
  }

  @Mutation(() => DbUser)
  async createDbUser(
    @Arg('input', () => DbUserInput) input: DbUserInput,
    @Arg('withoutChange', { nullable: true }) withoutChange: boolean
  ): Promise<DbUser> {
    return (await DbmsRepo.getById(input.dbmsId)).createUser(
      input,
      withoutChange
    );
  }

  @Mutation(() => Boolean)
  async addDbUserToDb(
    @Arg('userId') userId: string,
    @Arg('dbId') dbId: string,
    @Arg('withoutChange', { nullable: true }) withoutChange: boolean
  ): Promise<boolean> {
    return (await DbmsRepo.getById(dbId)).addUserToDb(
      userId,
      dbId,
      withoutChange
    );
  }

  @Mutation(() => Boolean)
  async restoreDbUsers(@Arg('dbId') dbId: string): Promise<boolean> {
    return (await DbmsRepo.getById(dbId)).restoreDbPrivileges(dbId);
  }

  @Mutation(() => DbSchema)
  async saveDbSchema(
    @Arg('dbId') dbId: string,
    @Arg('name', { nullable: true }) name: string
  ): Promise<DbSchema> {
    return (await DbmsRepo.getById(dbId)).saveSchema(dbId, name);
  }

  @Mutation(() => DbBackup)
  async backupDb(
    @Arg('dbId') dbId: string,
    @Arg('name', { nullable: true }) name: string,
    @Arg('withoutData', { nullable: true }) withoutData: boolean
  ): Promise<DbBackup> {
    return (await DbmsRepo.getById(dbId)).backup(dbId, name, withoutData);
  }

  @Mutation(() => Boolean)
  async restoreDb(
    @Arg('dbId') dbId: string,
    @Arg('backupId') backupId: string
  ): Promise<boolean> {
    return (await DbmsRepo.getById(dbId)).restore(dbId, backupId);
  }

  @Mutation(() => Boolean)
  async cloneDb(
    @Arg('fromDbId') fromDbId: string,
    @Arg('toDbId') toDbId: string,
    @Arg('fromDbUserId', { nullable: true }) fromDbUserId: string
  ): Promise<boolean> {
    return (await DbmsRepo.getById(fromDbId)).cloneDb(
      fromDbId,
      toDbId,
      fromDbUserId
    );
  }

  @Mutation(() => [MassDbQueryResult])
  async massDbQuery(
    @Arg('dbmsId') dbmsId: string,
    @Arg('dbNames', () => [String]) dbNames: string[],
    @Arg('query') query: string,
    @Ctx() ctx: Context
  ): Promise<MassDbQueryResult[]> {
    return (await DbmsRepo.getById(dbmsId)).massDbQuery(dbNames, query);
  }

  @Mutation(() => DbBackup)
  async uploadBackupText(
    @Arg('type') type: string,
    @Arg('backupText') backupText: string
  ): Promise<DbBackup> {
    return (await DbmsRepo.getByType(type)).uploadBackupText(backupText, type);
  }
}

@Resolver(() => Dbms)
export class DbmsTableResolver extends BaseTableResolver {
  @FieldResolver(() => [Db])
  async dbs(@Root() dbms: Dbms): Promise<Db[]> {
    return (await DbmsRepo.getById(dbms.id)).getDbs();
  }

  @FieldResolver(() => [String])
  async internalDbs(
    @Root() dbms: Dbms,
    @Ctx() ctx: Context
  ): Promise<string[]> {
    return (await DbmsRepo.getById(dbms.id)).getInternalDbs();
  }

  @FieldResolver(() => [DbUser])
  async users(@Root() dbms: Dbms): Promise<DbUser[]> {
    return (await DbmsRepo.getById(dbms.id)).getUsers();
  }

  @FieldResolver(() => [String])
  async internalUsers(@Root() dbms: Dbms): Promise<string[]> {
    return (await DbmsRepo.getById(dbms.id)).getInternalUsers();
  }
}
