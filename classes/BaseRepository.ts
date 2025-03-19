import { Knex } from 'knex';
import { knex } from '../corePostgres';
import { IEntity } from '../modules/models/tables';
import { defaultRights, resources } from '../src/features/rights/resources_list';
import { RightsChecker } from '../src/features/rights/rights_checker';
import { Context } from '../types';

abstract class BaseRepository<T extends IEntity> {
  id?: string;

  ctx?: Context;

  _data?: Promise<T>;

  isInternal = true;

  get data(): Promise<T> | undefined {
    if (!this._data) {
      this._data = this.getData();
    }
    return this._data;
  }

  constructor(
    ctx?: Context,
    id: string | T | undefined = undefined,
  ) {
    if (id && typeof id === 'string') {
      this.id = id;
    } else if (id && typeof id === 'object') {
      this.id = id.id;
      this._data = Promise.resolve(id);
    }
    this.ctx = ctx;
  }

  abstract getTable(): string;

  // ACCESS CHECKERS
  async haveActionAccess(action: string) {
    if (!resources[this.getTable()]) {
      return true;
    }

    return RightsChecker.check(this.ctx?.user?.id, {
      resourceType: this.getTable(),
      resourceId: this.id,
      action,
    });
  }

  async checkActionAccess(action: string) {
    if (!await this.haveActionAccess(action)) {
      this._throwAccessDenied();
    }
  }

  async filterEntitiesByAccess(entities: T[]): Promise<T[]> {
    if (!resources[this.getTable()]) {
      return entities;
    }

    return RightsChecker.filter(this.ctx?.user?.id, {
      resourceType: this.getTable(),
      resourceId: '*',
      action: defaultRights.read,
    }, entities);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async checkEntityData(entity: Partial<T>, isCreate: boolean = false) {
    return !!entity;
  }

  async checkEntitiesOfOrganization(
    ids: string[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    organizationId: string,
  ): Promise<T[]> {
    const entities = await this.getByIds(ids);
    return entities;
  }

  async filterEntities(_knex: Knex.QueryBuilder) {
    return _knex;
  }

  async getData(update: boolean = false): Promise<T> {
    if (!update && this._data) return this._data;
    if (!this.id) throw new Error('Id not found');
    await this.checkActionAccess(defaultRights.read);
    const entity = await knex.select('*').from(this.getTable()).where(
      'id',
      this.id,
    )
      .first();
    if (!entity) throw new Error('Entity not found');
    return entity;
  }

  async getAll(): Promise<T[]> {
    const result = await this.filterEntities(
      knex.select(`${this.getTable()}.*`).from(this.getTable())
        .orderBy(this._orderBy(), this._orderByDirection()),
    );
    return this.filterEntitiesByAccess(result);
  }

  async getByIds(ids: string[]): Promise<T[]> {
    const result = await this.filterEntities(
      knex.select(`${this.getTable()}.*`)
        .from(this.getTable()).whereIn(`${this.getTable()}.id`, ids)
        .orderBy(this._orderBy(), this._orderByDirection()),
    );
    return this.filterEntitiesByAccess(result);
  }

  async getByFields(fields: Partial<T>): Promise<T[]> {
    const result = await this.filterEntities(
      knex.select(`${this.getTable()}.*`)
        .from(this.getTable()).where(fields)
        .orderBy(this._orderBy(), this._orderByDirection()),
    );
    return this.filterEntitiesByAccess(result);
  }

  async getByQuery(
    callback: (knex: Knex.QueryBuilder<any, T>) => Knex.QueryBuilder,
  ): Promise<T[]> {
    const result = await this.filterEntities(
      callback(
        knex.select(`${this.getTable()}.*`).from(this.getTable())
          .orderBy(
            this._orderBy(),
            this._orderByDirection(),
          ) as Knex.QueryBuilder,
      ),
    );
    return this.filterEntitiesByAccess(result);
  }

  async create(entity: Partial<T>): Promise<T> {
    await this.checkActionAccess(defaultRights.create);
    entity.create_date = new Date();
    await this.checkEntityData(entity, true);
    const [created] = await knex(this.getTable()).insert(entity).returning('*');
    this.id = created.id;
    if (!!resources[this.getTable()]) {
      const { default: UserGroupPrivilege } = await import('./UserGroupPrivilege');
      await new UserGroupPrivilege(this.ctx).pushOwner(
        this.getTable(),
        this.id,
      );
    }
    return created;
  }

  async edit(entity: Partial<T>): Promise<T> {
    await this.checkActionAccess(defaultRights.edit);
    entity.update_date = new Date();
    await this.checkEntityData(entity);
    const [edited] = await knex(this.getTable()).where('id', this.id)
      .update(entity).returning('*');
    await this.getData(true);
    return edited;
  }

  async delete(): Promise<boolean> {
    await this.checkActionAccess(defaultRights.remove);
    await this.getData();
    await knex(this.getTable()).where('id', this.id)
      .delete();
    return true;
  }

  protected _throwAccessDenied() {
    throw new Error(
      'Access denied (table: ' + this.getTable() + ', uuid: ' + this.id
        + ', userId: ' + this.ctx?.user?.id + ')',
    );
  }

  private _orderBy(): string {
    return `${this.getTable()}.create_date`;
  }

  private _orderByDirection(): 'asc' | 'desc' {
    return 'desc';
  }
}

export default BaseRepository;
