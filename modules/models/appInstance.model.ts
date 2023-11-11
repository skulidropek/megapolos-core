/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { knex } from '../../coreRqlite';
import { AppInstanceTable, ContainerEnvOptionTable, ContainerTable } from './tables';

class AppInstanceModel {
  static async createAppInstance(input: Partial<AppInstanceTable>) {
    await knex.table<AppInstanceTable>('app_instance').insert(input);
  }

  static async getAppInstance(appInstanceId: string):Promise<AppInstanceTable> {
    return knex<AppInstanceTable>('app_instance').select('app_instance.*').where('app_instance.id', appInstanceId).first();
  }

  static async getInstancesOfApp(appId: string):Promise<AppInstanceTable[]> {
    return knex<AppInstanceTable>('app_instance').select('app_instance.*').where('app_instance.app_id', appId);
  }
  
  static async getFirstAppInstanceOfApp(appId: string):Promise<AppInstanceTable> {
    return knex<AppInstanceTable>('app_instance').select('app_instance.*').where('app_instance.app_id', appId).first();
  }

  static async getAppInstances():Promise<AppInstanceTable[]> {
    return knex<AppInstanceTable>('app_instance').select('app_instance.*');
  }

  static async getAppInstanceContainers(appInstanceId: string):Promise<ContainerTable[]> {
    return knex<ContainerTable>('container').select('container.*').where('container.app_instance_id', appInstanceId);
  }

  static async getContainer(containerId: string):Promise<ContainerTable> {
    return knex<ContainerTable>('container').select('container.*').where('container.id', containerId).first();
  }

  static async getContainers():Promise<ContainerTable[]> {
    return knex<ContainerTable>('container').select('container.*');
  }

  static async updateAppInstanceLifeStatus(appInstanceId: string, lifeStatus: string) {
    return knex<AppInstanceTable>('app_instance').update({ life_status: lifeStatus }).where('id', appInstanceId);
  }

  static async getContainerEnvOptions(containerId: string):Promise<ContainerEnvOptionTable[]> {
    return knex<ContainerEnvOptionTable>('container_env_option')
      .select('container_env_option.*')
      .where('container_env_option.container_id', containerId);
  }

  static async addContainerEnvOption(input: Partial<ContainerEnvOptionTable>) {
    await knex<ContainerEnvOptionTable>('container_env_option').insert(input);
  }

  static async removeContainerEnvOptions(containerId: string) {
    await knex<ContainerEnvOptionTable>('container_env_option').delete().where('container_id', containerId);
  }

  static async createContainer(input: Partial<ContainerTable>) {
    await knex<ContainerTable>('container').insert(input);
  }

  static async updateContainerLifeStatus(containerId: string, lifeStatus: string) {
    await knex<ContainerTable>('container').update({ life_status: lifeStatus }).where('id', containerId);
  }

  static async updateContainerDockerRuntimeId(containerId: string, dockerRuntimeId: string) {
    await knex<ContainerTable>('container').update({ docker_runtime_id: dockerRuntimeId }).where('id', containerId);
  }

  static async deleteContainer(containerId: string) {
    await knex<ContainerTable>('container').delete().where('id', containerId);
  }

  static async getUsedPorts():Promise<ContainerTable[]> {
    return knex<ContainerTable>('container').select('container.outer_port');
  }

  static async removeAppInstance(appInstanceId: string) {
    await knex<AppInstanceTable>('app_instance').delete().where('id', appInstanceId);
  }

  static async editInstance(instanceId: string, input: { name: string }) {
    await knex.table<AppInstanceTable>('app_instance').update(input).where('id', instanceId);
  }

  static async editContainer(containerId: string, input: { name: string, outer_port: number }) {
    await knex.table<ContainerTable>('container').update(input).where('id', containerId);
  }

}

export default AppInstanceModel;