import { v4 as uuidv4 } from 'uuid';
import fse from 'fs-extra';
import AppModel from '../modules/models/app.model';
import { ContainerTable, ImageStatus, ImageTable } from '../modules/models/tables';
import App from './App';
import Entity from '../modules/models/Entity';
import docker from '../coreDocker';
import { megapolosPath } from '..';
import Repository from './Repository';
import MegapolosNode from './Node';
import User from './User';
import config from '../config/config.json';
import Log from './Log';

class Image {
  id: string;

  static async getImagesData(): Promise<ImageTable[]> {
    return new Entity<ImageTable>('image').findAll();
  }

  static async getImages(): Promise<Image[]> {
    const data = await this.getImagesData();
    return data.map((item) => new Image(item.id));
  }

  constructor(id: string) {
    this.id = id;
  }

  static async createImage(input: Partial<ImageTable>): Promise<Image> {
    const entity = await new Entity<ImageTable>('image').create(input);
    return new Image(entity.id);
  }

  getData(): Promise<ImageTable> {
    return AppModel.getImage(this.id);
  }

  async build(userId: string) {
    const data = await this.getData();
    if (!data.repository_id) {
      return;
    }
    const path = megapolosPath + '/data/' + uuidv4();
    if (!await fse.exists(path)) {
      await fse.mkdir(path);
    }
    const repository = new Repository(data.repository_id);
    await repository.fetch();
    await repository.copyBranchTo(path, data.branch);
    console.log(data);
    if (data.repository_id) {
      const entity = new Entity<ImageTable>('image');
      entity.update({ id: this.id }, { status: ImageStatus.Building });
      try {
        const log = new Log();
        await log.create({ name: 'Build image ' + data.name });
    
        const result = await MegapolosNode.currentNode.shellCommand(
          `cd ${path} && docker build -t ${data.image} -t ${config.registryHost}:443/${data.image} .`, new User(userId), log).output;
        await MegapolosNode.currentNode.shellCommand(`docker login -u '${config.registryUser}' -p '${config.registryPassword}' ${config.registryHost}:443`, new User(userId), log).output;
        await MegapolosNode.currentNode.shellCommand(`docker push ${config.registryHost}:443/${data.image}`, new User(userId), log).output;
        entity.update({ id: this.id }, { status: ImageStatus.Built, last_build_date: new Date() });
        console.log(result);
        if (await fse.exists(path)) {
          await fse.remove(path);
        }    
      } catch (error) {
        entity.update({ id: this.id }, { status: ImageStatus.NotExist });
        console.error(error);
        if (await fse.exists(path)) {
          await fse.remove(path);
        }
      }
    }
  }

  async edit(input: Partial<ImageTable>): Promise<void> {
    await new Entity<ImageTable>('image').update({ id: this.id }, input);
  }

  async remove() {
    await new Entity<ImageTable>('image').delete({ id: this.id });
  }    

  async getApp(): Promise<App> {
    const data = await this.getData();
    return new App(data.app_id);
  }
  
  async updateNodes(): Promise<void> {
    const containerEntity = new Entity<ContainerTable>('container');
    const containers = await containerEntity.findAll({ image_id: this.id });
    const nodes: string[] = [];
    for (let i in containers) {
      const container = containers[i];
      if (container.node_id && !nodes.includes(container.node_id)) {
        nodes.push(container.node_id);
        await new MegapolosNode(container.node_id).update();
      }
    }
    console.log(nodes);
  }

}

export default Image;