import { v4 as uuidv4 } from 'uuid';
import AppModel from '../modules/models/app.model';
import { ImageTable } from '../modules/models/tables';
import App from './App';

class Image {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  static async createImage(appId: string, input: { name: string, image: string, inner_port: number }): Promise<Image> {
    const imageId = uuidv4();
    await AppModel.createImage({
      imageId,
      name: input.name,
      appId,
      image: input.image,
      commitId: '',
      innerPort: input.inner_port,
    });
    return new Image(imageId);
  }

  getData(): Promise<ImageTable> {
    return AppModel.getImage(this.id);
  }

  async edit(name: string, image: string, inner_port: number): Promise<void> {
    await AppModel.editImage(this.id, { name, image, inner_port });
  }

  remove() {
    return AppModel.removeImage(this.id);
  }    

  async getApp(): Promise<App> {
    const data = await this.getData();
    return new App(data.app_id);
  }
}

export default Image;