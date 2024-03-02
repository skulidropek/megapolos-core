import { knex } from '../../coreRqlite';

class Entity<T> {
  table: string;

  constructor(table: string) {
    this.table = table;
  }

  async findAll(where?: Partial<T>): Promise<T[]> {
    const query = knex(this.table).select('*');
    if (where) {
      query.where(where);
    }
    return query;
  }

  async findOne(where?: Partial<T>): Promise<T> {
    const query = knex(this.table).select('*');
    if (where) {
      query.where(where);
    }
    return query.first();
  }

  async create(data: Partial<T>): Promise<T> {
    return (await knex(this.table).insert(data).returning('*'))[0];
  }

  async update(where: Partial<T>, data: Partial<T>): Promise<T> {
    await knex(this.table).update(data).where(where);
    return this.findOne(where);
  }

  async delete(where: Partial<T>): Promise<void> {
    await knex(this.table).delete().where(where);
  }
}

export default Entity;