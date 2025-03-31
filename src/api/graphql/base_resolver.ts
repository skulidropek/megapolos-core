import { Resolver, Query, Mutation, Arg, ClassType, Ctx } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';
import { Context } from './server';

// Создаем базовый класс для CRUD операций
export function createBaseResolver<T extends { id: string }, I extends object>(
  suffix: string,
  entityClass: ClassType<T>,
  inputClass: ClassType<I>
) {
  @Resolver()
  abstract class BaseResolver {
    // Получить все записи
    @Query(() => [entityClass], { name: `getAll${suffix}` })
    async getAll(@Ctx() ctx: Context): Promise<T[]> {
      return ctx.em.find(entityClass, {});
    }

    // Получить запись по ID
    @Query(() => entityClass, { nullable: true, name: `get${suffix}` })
    async getOne(
      @Arg('id') id: string,
      @Ctx() ctx: Context
    ): Promise<T | null> {
      return ctx.em.findOne(entityClass, { id } as FilterQuery<T>);
    }

    // Создать запись
    @Mutation(() => entityClass, { name: `create${suffix}` })
    async create(
      @Ctx() ctx: Context,
      @Arg('values', () => inputClass) values: I
    ): Promise<T> {
      const entity = ctx.em.create(entityClass, values as any);
      await ctx.em.persistAndFlush(entity);
      return entity;
    }

    // Обновить запись
    @Mutation(() => entityClass, { name: `update${suffix}` })
    async update(
      @Ctx() ctx: Context,
      @Arg('id') id: string,
      @Arg('values', () => inputClass) values: I
    ): Promise<T> {
      const entity = await ctx.em.findOneOrFail(entityClass, {
        id,
      } as FilterQuery<T>);
      ctx.em.assign(entity, values as any);
      await ctx.em.flush();
      return entity;
    }

    // Удалить запись
    @Mutation(() => Boolean, { name: `delete${suffix}` })
    async delete(@Ctx() ctx: Context, @Arg('id') id: string): Promise<boolean> {
      const entity = await ctx.em.findOne(entityClass, {
        id,
      } as FilterQuery<T>);
      if (!entity) return false;
      await ctx.em.removeAndFlush(entity);
      return true;
    }
  }

  return BaseResolver;
}
