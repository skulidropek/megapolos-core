import { megapolosPath } from '..';
import Entity from '../modules/models/Entity';
import { DomainTable } from '../modules/models/tables';
import simpleGit from 'simple-git';
import fse from 'fs-extra';

class Domain {
  id: string;

  static async create(data: Partial<Domain>): Promise<Domain> {
    const domainData = await new Entity<DomainTable>('domain').create(data);
    const domain = new Domain(domainData.id);
    return domain;
  }

  static async getAllData():Promise<DomainTable[]> {
    return new Entity<DomainTable>('domain').findAll(null, 'name');
  }

  static async getAll():Promise<Domain[]> {
    const data = await this.getAllData();
    return data.map((item) => new Domain(item.id));
  }

  constructor(id: string) {
    this.id = id;
  }

  async getData():Promise<DomainTable> {
    return new Entity<DomainTable>('domain').findOne({ id: this.id });
  }

  async edit(data: Partial<DomainTable>) {
    await new Entity<DomainTable>('domain').update({ id: this.id }, data);
  }

  async remove() {
    await new Entity<DomainTable>('domain').delete({ id: this.id });
  }

}

export default Domain;