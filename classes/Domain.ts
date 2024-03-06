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
    return new Entity<DomainTable>('domain').findAll();
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

}

export default Domain;