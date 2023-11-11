/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { knex } from '../../coreRqlite';
import { AppTable, ImageTable } from './tables';

class AppModel {
  static async createApp(input: { id: string, ownerUserId: string, name: string }) {
    await knex.table<AppTable>('app').insert({ id: input.id, owner_user_id: input.ownerUserId, name: input.name });
  }

  static async getApp(appId: string):Promise<AppTable> {
    return knex<AppTable>('app').select('app.*').where('app.id', appId).first();
  }

  static async getApps():Promise<AppTable[]> {
    return knex<AppTable>('app').select('app.*');
  }

  static async getImage(imageId: string):Promise<ImageTable> {
    return knex<ImageTable>('image').select('image.*').where('image.id', imageId).first();
  }

  static async getImagesOfApp(appId: string):Promise<ImageTable[]> {
    return knex<ImageTable>('image').select('image.*').where('image.app_id', appId);
  }

  static async createImage(input: { imageId: string, name: string, appId: string, image: string, commitId: string, innerPort: number }) {
    await knex.table<ImageTable>('image').insert({ id: input.imageId, 
      name: input.name, 
      app_id: input.appId, 
      image: input.image, 
      commit_id: input.commitId, 
      inner_port: input.innerPort });
  }

  static async removeApp(appId: string) {
    await knex.table<AppTable>('app').delete().where('id', appId);
  }

  static async removeImage(imageId: string) {
    await knex.table<ImageTable>('image').delete().where('id', imageId);
  }

  static async editApp(appId: string, input: { name: string }) {
    await knex.table<AppTable>('app').update(input).where('id', appId);
  }

  static async editImage(imageId: string, input: { name: string, image: string, inner_port: number }) {
    await knex.table<ImageTable>('image').update(input).where('id', imageId);
  }

}

export default AppModel;