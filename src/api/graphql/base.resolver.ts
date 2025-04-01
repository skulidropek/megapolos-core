import { Resolver, Query, Mutation, Arg, ClassType, Ctx } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';
import { Context } from './server';
import { GraphQLResolveInfo } from 'graphql';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../library/graphql_types_generator';
import { makeEm } from '../../features/db/mikro-orm';

export function CreateBaseResolver<T extends { id: string }>(
  className: string,
  EntityClass: ClassType<T>
) {
  const InputClass = generateGraphQLInputType(
    EntityClass,
    `${className}Input`,
    GenerationType.input
  );

  const InputPartialClass = generateGraphQLInputType(
    EntityClass,
    `${className}InputPartial`,
    GenerationType.inputPartial
  );

  @Resolver()
  abstract class BaseResolver {
    @Query(() => [EntityClass], { name: `getAll${className}` })
    async getAll(@Ctx() ctx: Context): Promise<T[]> {
      return makeEm().find(EntityClass, {});
    }

    @Query(() => EntityClass, { nullable: true, name: `get${className}` })
    async getOne(
      @Arg('id') id: string,
      @Ctx() ctx: Context
    ): Promise<T | null> {
      return makeEm().findOne(EntityClass, { id } as FilterQuery<T>);
    }

    @Mutation(() => EntityClass, { name: `create${className}` })
    async create(
      @Ctx() ctx: Context,
      @Arg('values', () => InputClass) values: { toStruct: () => any }
    ): Promise<T> {
      const rawEntity = await makeEm()
        .qb(EntityClass)
        .insert(values.toStruct() as any)
        .execute('get');
      return makeEm().map(EntityClass, rawEntity as any);
    }

    @Mutation(() => EntityClass, { name: `update${className}` })
    async update(
      @Ctx() ctx: Context,
      @Arg('id') id: string,
      @Arg('values', () => InputPartialClass) values: { toStruct: () => any }
    ): Promise<T> {
      const rawEntity = await makeEm()
        .qb(EntityClass)
        .update(values.toStruct() as any)
        .where({ id })
        .returning('*')
        .execute('get');
      return makeEm().map(EntityClass, rawEntity as any);
    }

    @Mutation(() => Boolean, { name: `delete${className}` })
    async delete(@Ctx() ctx: Context, @Arg('id') id: string): Promise<boolean> {
      const result = await makeEm()
        .qb(EntityClass)
        .delete()
        .where({ id })
        .execute();

      return result.affectedRows > 0;
    }
  }

  return BaseResolver;
}

export class BaseTableResolver {
  getRequestedFields(info: GraphQLResolveInfo): string[] {
    const selections = info.fieldNodes[0].selectionSet?.selections || [];
    return selections
      .map((selection) => {
        if (selection.kind === 'Field') {
          return selection.name.value;
        }
        return null;
      })
      .filter(Boolean) as string[];
  }

  returnOnlyThisFields<T>(
    info: GraphQLResolveInfo,
    fields: Record<string, any>,
    request: () => Promise<T>
  ): Promise<T> {
    const requestedFields = this.getRequestedFields(info);
    if (requestedFields.every((field) => Object.keys(fields).includes(field))) {
      return fields as any;
    }
    return request();
  }

  returnOnlyIdIfNeeded<T>(
    info: GraphQLResolveInfo,
    id: string,
    request: () => Promise<T>
  ): Promise<T> {
    return this.returnOnlyThisFields(info, { id }, request);
  }
}
