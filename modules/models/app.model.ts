import coreRqlite from '../../coreRqlite';
import { AppInstanceTable, AppTable, ContainerDeviceEnvOptionTable, ContainerTable, ImageTable } from './tables';

class AppModel {
  static async createApp(input: { id: string, ownerUserId: string, name: string }) {
    await coreRqlite.execute([[`
        INSERT INTO app (id, owner_user_id, name) 
        VALUES (?, ?, ?)
    `, input.id, input.ownerUserId, input.name]]);
  }

  static async getApp(appId: string):Promise<AppTable> {
    return (await coreRqlite.query([[`
      SELECT * FROM app WHERE id = ?
    `, appId]])).toArray()[0];
  }

  static async getApps():Promise<AppTable[]> {
    return (await coreRqlite.query('SELECT * FROM app')).toArray();
  }

  static async getImage(imageId: string):Promise<ImageTable> {
    return (await coreRqlite.query([['SELECT * FROM image WHERE id = ?', imageId]])).toArray()[0];
  }

  static async getImagesOfApp(appId: string):Promise<ImageTable[]> {
    return (await coreRqlite.query([[`
      SELECT * FROM image WHERE app_id = ?
    `, appId]])).toArray();
  }

  static async createImage(input: { imageId: string, name: string, appId: string, image: string, commitId: string, innerPort: number }) {
    await coreRqlite.execute([[`
        INSERT INTO image (id, name, app_id, image, commit_id, inner_port)
        VALUES (?, ?, ?, ?, ?, ?)
      `, input.imageId, input.name, input.appId, input.image, input.commitId, input.innerPort as any]]);
  }

  static async removeApp(appId: string) {
    await coreRqlite.execute([[
      'DELETE FROM app WHERE id = ?', appId]]);
  }

  static async removeImage(imageId: string) {
    await coreRqlite.execute([[`
      DELETE FROM image WHERE id = ?
    `, imageId]]);
  }

}

export default AppModel;