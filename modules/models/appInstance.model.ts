import coreRqlite from '../../coreRqlite';
import { AppInstanceTable, AppTable, ContainerDeviceEnvOptionTable, ContainerTable, ImageTable } from './tables';

class AppInstanceModel {
  static async createAppInstance(input: Partial<AppInstanceTable>) {
    await coreRqlite.execute([[`
    INSERT INTO app_instance (id, name, user_id, life_status, app_instance_url, app_id, instance_type_id, deploy_strategy_id, remove_strategy_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, input.id, input.name, input.user_id, input.life_status, 
    input.app_instance_url, input.app_id, input.instance_type_id, 
    input.deploy_strategy_id, input.remove_strategy_id]]);
  }

  static async getAppInstance(appInstanceId: string):Promise<AppInstanceTable> {
    return (await coreRqlite.query([['SELECT * FROM app_instance WHERE id = ?', appInstanceId]])).toArray()[0];
  }

  static async getFirstAppInstanceOfApp(appId: string):Promise<AppInstanceTable> {
    return (await coreRqlite.query([[`
      SELECT * FROM app_instance WHERE app_id = ?
    `, appId]])).toArray()[0];
  }

  static async getAppInstances():Promise<AppInstanceTable[]> {
    return (await coreRqlite.query('SELECT * FROM app_instance')).toArray();
  }

  static async getAppInstanceContainers(appInstanceId: string):Promise<ContainerTable[]> {
    return (await coreRqlite.query([['SELECT * FROM container WHERE app_instance_id = ?', appInstanceId]])).toArray();
  }

  static async getContainer(containerId: string):Promise<ContainerTable> {
    return (await coreRqlite.query([['SELECT * FROM container WHERE id = ?', containerId]])).toArray()[0];
  }

  static async getContainers():Promise<ContainerTable[]> {
    return (await coreRqlite.query([['SELECT * FROM container']])).toArray();
  }

  static async updateAppInstanceLifeStatus(appInstanceId: string, lifeStatus: string) {
    await coreRqlite.execute([[
      'UPDATE app_instance SET life_status = ? WHERE id = ?', lifeStatus, appInstanceId
    ]]);
  }

  static async createContainer(input: Partial<ContainerTable>) {
    await coreRqlite.execute([[`
        INSERT INTO container (id, docker_runtime_id, name, image_id, node_id, outer_port, app_instance_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, input.id, input.docker_runtime_id, input.name, input.image_id, input.node_id, input.outer_port as any, input.app_instance_id]]);
  }

  static async updateContainerLifeStatus(containerId: string, lifeStatus: string) {
    await coreRqlite.execute([['UPDATE container SET life_status = ? WHERE id = ?', lifeStatus, containerId]]);
  }

  static async updateContainerDockerRuntimeId(containerId: string, dockerRuntimeId: string) {
    await coreRqlite.execute([['UPDATE container SET docker_runtime_id = ? WHERE id = ?', dockerRuntimeId, containerId]]);
  }

  static async deleteContainer(containerId: string) {
    await coreRqlite.execute([['DELETE FROM container WHERE id = ?', containerId]]);
  }

  static async getUsedPorts():Promise<ContainerTable[]> {
    return (await coreRqlite.query('SELECT outer_port FROM container')).toArray();
  }

  static async removeAppInstance(appInstanceId: string) {
    await coreRqlite.execute([[
      'DELETE FROM app_instance WHERE id = ?', appInstanceId]]);
  }

}

export default AppInstanceModel;