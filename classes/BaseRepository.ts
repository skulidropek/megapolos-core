import { Knex } from 'knex';
import { knex } from '../corePostgres';

interface IEntity {
  id: string
  create_date: Date
  update_date: Date
}

abstract class BaseRepository<T extends IEntity> {

  id?: string;

  _data?: Promise<T>;

  isInternal = true;

  get data(): Promise<T> | undefined {
    if (!this._data) {
      this._data = this.getData();
    }
    return this._data;
  }

  constructor(id: string | T | undefined = undefined) {
    if (id && typeof id === 'string') {
      this.id = id;
    } else if (id && typeof id === 'object') {
      this.id = id.id;
      this._data = Promise.resolve(id);
    }
  }
  
  abstract getTable(): string;

  async checkEntityAccess(entity: Partial<T>) {
    return !!entity;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async checkEntityData(entity: Partial<T>, isCreate: boolean = false) {
    return !!entity;
  }

  async checkEntities(ids: string[]): Promise<T[]> {
    const entities = await this.getByIds(ids);
    if (entities.length !== ids.length) {
      throw new Error('Access denied');
    }
    return entities;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async checkEntitiesOfOrganization(ids: string[], organizationId: string): Promise<T[]> {
    const entities = await this.getByIds(ids);
    return entities;
  }

  async filterEntities(_knex: Knex.QueryBuilder) {
    return _knex;
  }
  
  async getData(update: boolean = false): Promise<T> {
    if (!update && this._data) return this._data;
    if (!this.id) throw new Error('Id not found');
    const entity = await knex.select('*').from(this.getTable()).where('id', this.id)
      .first();
    if (!entity) throw new Error('Entity not found');
    await this.checkEntityAccess(entity);
    return entity;
  }

  orderBy(): string {
    return `${this.getTable()}.create_date`;
  }

  orderByDirection(): 'asc' | 'desc' {
    return 'desc';
  }

  async getAll(): Promise<T[]> {
    const result = await this.filterEntities(knex.select(`${this.getTable()}.*`).from(this.getTable())
      .orderBy(this.orderBy(), this.orderByDirection()));
    return result;
  }

  async getByIds(ids: string[]): Promise<T[]> {
    const result = await this.filterEntities(knex.select(`${this.getTable()}.*`)
      .from(this.getTable()).whereIn(`${this.getTable()}.id`, ids)
      .orderBy(this.orderBy(), this.orderByDirection()));
    return result;
  }

  async getByFields(fields: Partial<T>): Promise<T[]> {
    const result = await this.filterEntities(knex.select(`${this.getTable()}.*`)
      .from(this.getTable()).where(fields)
      .orderBy(this.orderBy(), this.orderByDirection()));
    return result;
  }

  async getByQuery(callback: (knex: Knex.QueryBuilder<any, T>) => Knex.QueryBuilder): Promise<T[]> {
    const result = await this.filterEntities(
      callback(
        knex.select(`${this.getTable()}.*`).from(this.getTable())
          .orderBy(this.orderBy(), this.orderByDirection()) as Knex.QueryBuilder,
      ),
    );
    return result;
  }

  async create(entity: Partial<T>): Promise<T> {
    entity.create_date = new Date();
    await this.checkEntityAccess(entity);
    await this.checkEntityData(entity, true);
    const [created] = await knex(this.getTable()).insert(entity).returning('*');
    this.id = created.id;
    return created;
  }

  async edit(entity: Partial<T>): Promise<T> {
    entity.update_date = new Date();
    const data = await this.data;
    await this.checkEntityAccess(data as T);
    await this.checkEntityAccess(entity);
    await this.checkEntityData(entity);
    const [edited] = await knex(this.getTable()).where('id', this.id).
      update(entity).returning('*');
    await this.getData(true);
    return edited;
  }

  async delete(): Promise<boolean> {
    await this.getData();
    await knex(this.getTable()).where('id', this.id).
      delete();
    return true;
  }
}

export default BaseRepository;