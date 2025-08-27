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
import {
  DbSchemaSchema,
  DbSchema,
} from '../../../domain/entities/DbSchema.entity';
import { Context } from '../server';
import DbmsRepo from '../../../features/repository/dbms/dbms.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import BaseDbmsRepo from '../../../features/repository/dbms/base.dbms.repository';
import DbBackupRepo from '../../../features/repository/db/db.backup.repository';
import { RequiredEntityData } from '@mikro-orm/core';
import DbUserRepo from '../../../features/repository/db/db.user.repository';
import DbSchemaRepo from '../../../features/repository/db/db.schema.repository';
import DbRepo from '../../../features/repository/db/db.repository';
import { makeEm } from '../../../features/db/mikro-orm';
import { DbUserInput } from './db.user.resolver';
import { ContainerDb } from '../../../domain/entities/ContainerDb.entity';

export const DbInput = generateGraphQLInputType(
  Db,
  'DbInput',
  GenerationType.input
);

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

  @Query(() => DbSchema)
  async getDbSchema(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<DbSchema> {
    return new DbSchemaRepo(ctx, id).getEntity();
  }

  @Query(() => [DbSchema])
  async getAllDbSchema(@Ctx() ctx: Context): Promise<DbSchema[]> {
    return new DbSchemaRepo(ctx).getAll();
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

  @Query(() => Db)
  async getDb(@Arg('id') id: string, @Ctx() ctx: Context): Promise<Db> {
    return new DbRepo(ctx, id).getEntity();
  }

  @Query(() => [Db])
  async getAllDb(@Ctx() ctx: Context): Promise<Db[]> {
    return new DbRepo(ctx).getAll();
  }

  @Query(() => DbBackup)
  async getDbBackup(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<DbBackup> {
    return new DbBackupRepo(ctx, id).getEntity();
  }

  @Query(() => [DbBackup])
  async getDbBackups(@Ctx() ctx: Context): Promise<DbBackup[]> {
    return new DbBackupRepo(ctx).getAll();
  }

  @Mutation(() => Dbms)
  async createDbms(
    @Arg('values', () => DbmsInput) values: RequiredEntityData<Dbms>
  ): Promise<Dbms> {
    return (await DbmsRepo.getByType(values.type)).create(values);
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
    @Arg('values', () => DbInput) values: any,
    @Arg('withoutChange', { nullable: true }) withoutChange: boolean
  ): Promise<Db> {
    return (await DbmsRepo.getById(values.dbms)).createDb(
      values,
      withoutChange
    );
  }

  @Mutation(() => DbUser)
  async createDbUser(
    @Arg('values', () => DbUserInput) values: any,
    @Arg('withoutChange', { nullable: true }) withoutChange: boolean
  ): Promise<DbUser> {
    return (await DbmsRepo.getById(values.dbms)).createUser(
      values,
      withoutChange
    );
  }

  @Mutation(() => Boolean)
  async addDbUserToDb(
    @Arg('userId') userId: string,
    @Arg('dbId') dbId: string,
    @Arg('withoutChange', { nullable: true }) withoutChange: boolean
  ): Promise<boolean> {
    return (await DbmsRepo.getByDbId(dbId)).addUserToDb(
      userId,
      dbId,
      withoutChange
    );
  }

  @Mutation(() => Boolean)
  async restoreDbUsers(@Arg('dbId') dbId: string): Promise<boolean> {
    return (await DbmsRepo.getByDbId(dbId)).restoreDbPrivileges(dbId);
  }

  @Mutation(() => DbSchema)
  async saveDbSchema(
    @Arg('dbId') dbId: string,
    @Arg('name', { nullable: true }) name: string
  ): Promise<DbSchema> {
    return (await DbmsRepo.getByDbId(dbId)).saveSchema(dbId, name);
  }

  @Mutation(() => DbBackup)
  async backupDb(
    @Arg('dbId') dbId: string,
    @Arg('name', { nullable: true }) name: string,
    @Arg('withoutData', { nullable: true }) withoutData: boolean
  ): Promise<DbBackup> {
    return (await DbmsRepo.getByDbId(dbId)).backup(dbId, name, withoutData);
  }

  @Mutation(() => Boolean)
  async restoreDb(
    @Arg('dbId') dbId: string,
    @Arg('backupId') backupId: string
  ): Promise<boolean> {
    return (await DbmsRepo.getByDbId(dbId)).restore(dbId, backupId);
  }

  @Mutation(() => Boolean)
  async cloneDb(
    @Arg('fromDbId') fromDbId: string,
    @Arg('toDbId') toDbId: string,
    @Arg('fromDbUserId', { nullable: true }) fromDbUserId: string
  ): Promise<boolean> {
    return (await DbmsRepo.getByDbId(fromDbId)).cloneDb(
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

@Resolver(() => Db)
export class DbTableResolver extends BaseTableResolver {
  @FieldResolver(() => DbSchemaSchema)
  async schema(@Root() db: Db): Promise<DbSchemaSchema> {
    return (await DbmsRepo.getById(db.dbms.id)).getSchema(db.name);
  }

  @FieldResolver(() => [DbUser])
  async users(@Root() db: Db): Promise<DbUser[]> {
    return await makeEm().find(DbUser, {
      dbs: { id: db.id },
    });
  }

  @FieldResolver(() => Dbms, { nullable: false })
  async dbms(@Root() db: Db): Promise<Dbms> {
    return await makeEm().findOneOrFail(Dbms, {
      id: db.dbms.id,
    });
  }

  @FieldResolver(() => [ContainerDb])
  async containers(@Root() db: Db): Promise<ContainerDb[]> {
    return await makeEm().find(ContainerDb, {
      db: { id: db.id },
    });
  }
}

@Resolver(() => DbSchema)
export class DbSchemaTableResolver extends BaseTableResolver {
  @FieldResolver(() => DbSchemaSchema)
  async schema(@Root() dbSchema: DbSchema): Promise<DbSchemaSchema> {
    return JSON.parse(dbSchema.schema);
  }
}
