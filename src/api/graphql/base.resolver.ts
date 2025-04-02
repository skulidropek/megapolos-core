import { Resolver, Query, Mutation, Arg, ClassType, Ctx } from 'type-graphql';
import { Context } from './server';
import { GraphQLResolveInfo } from 'graphql';
import { IEntity } from '../../features/db/tables';
import BaseRepo from '../../features/new.repository/base.repository';

export function CreateBaseResolver<
  T extends IEntity,
  I extends object,
  P extends object
>(
  className: string,
  Repository: new (ctx: Context, id?: string) => BaseRepo<T>,
  EntityClass: ClassType<T>,
  InputClass: ClassType<I>,
  UpdateClass: ClassType<P>
) {
  @Resolver()
  abstract class BaseResolver {
    @Query(() => [EntityClass], { name: `getAll${className}` })
    async getAll(@Ctx() ctx: Context): Promise<T[]> {
      return new Repository(ctx).getAll();
    }

    @Query(() => EntityClass, { nullable: true, name: `get${className}` })
    async getOne(
      @Arg('id') id: string,
      @Ctx() ctx: Context
    ): Promise<T | null> {
      return new Repository(ctx, id).getEntity();
    }

    @Mutation(() => EntityClass, { name: `create${className}` })
    async create(
      @Ctx() ctx: Context,
      @Arg('values', () => InputClass) values: I
    ): Promise<T> {
      return new Repository(ctx).create(values as any);
    }

    @Mutation(() => Boolean, { name: `update${className}` })
    async update(
      @Ctx() ctx: Context,
      @Arg('id') id: string,
      @Arg('values', () => UpdateClass) values: P
    ): Promise<boolean> {
      return new Repository(ctx, id).update(values as any);
    }

    @Mutation(() => Boolean, { name: `delete${className}` })
    async delete(@Ctx() ctx: Context, @Arg('id') id: string): Promise<boolean> {
      return new Repository(ctx, id).delete();
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
