import { v4 as uuidv4 } from 'uuid';
import { knex } from '../../coreRqlite';
import { ContainerResourceEnvOptionTable, ContainerResourceTable, ContainerTable, ResourceCertificateTable, ResourceDbTable, ResourceDockerImageTable, ResourceDomainTable, ResourceRepositoryTable, ResourceTable } from './tables';

class ResourceModel {
  static async getResource(id:string):Promise<ResourceTable> {
    return knex<ResourceTable>('resource').select('resource.*').where('resource.id', id).first();
  }

  static async getCertificateResource(id:string):Promise<ResourceCertificateTable> {
    return knex<ResourceCertificateTable>('resource_certificate').select('resource_certificate.*').where('resource_certificate.id', id).first();
  }

  static async getDbResource(id:string):Promise<ResourceDbTable> {
    return knex<ResourceDbTable>('resource_db').select('resource_db.*').where('resource_db.id', id).first();
  }

  static async getDomainResource(id:string):Promise<ResourceDomainTable> {
    return knex<ResourceDomainTable>('resource_domain').select('resource_domain.*').where('resource_domain.id', id).first();
  }

  static async getRepositoryResource(id:string):Promise<ResourceRepositoryTable> {
    return knex<ResourceRepositoryTable>('resource_repository').select('resource_repository.*').where('resource_repository.id', id).first();
  }

  static async getDockerImageResource(id:string):Promise<ResourceDockerImageTable> {
    return knex<ResourceDockerImageTable>('resource_docker_image').select('resource_docker_image.*').where('resource_docker_image.id', id).first();
  }

  static async addResourceToContainer(input: { containerResourceId: string, containerId: string, resourceId: string }) {
    await knex<ContainerResourceTable>('container_resource').insert({
      id: input.containerResourceId,
      container_id: input.containerId,
      resource_id: input.resourceId,
    });
  }  

  static async removeResourceFromContainer(input: { containerId: string, resourceId: string }) {
    await knex<ContainerResourceTable>('container_resource').delete().where({
      container_id: input.containerId,
      resource_id: input.resourceId,
    });
    await knex<ContainerResourceEnvOptionTable>('container_resource_env_option').delete().where({
      container_id: input.containerId,
      resource_id: input.resourceId,
    });
  }

  static async addEnvToContainer(input: ContainerResourceEnvOptionTable) {
    await knex<ContainerResourceEnvOptionTable>('container_resource_env_option').insert(input);
  }

  static async getResourceEnvsOfContainer(resourceId: string, containerId: string):Promise<ContainerResourceEnvOptionTable[]> {
    return knex<ContainerResourceEnvOptionTable>('container_resource_env_option')
      .select('container_resource_env_option.*')
      .where({
        container_id: containerId,
        resource_id: resourceId,
      });
  }

  static async setResourceEnvOptionsOfContainer(resourceId: string, containerId: string, options: { key: string, value: string }[]) {
    await knex<ContainerResourceEnvOptionTable>('container_resource_env_option').delete().where({
      container_id: containerId,
      resource_id: resourceId,
    });
    await knex<ContainerResourceEnvOptionTable>('container_resource_env_option').insert(options.map(option => ({
      id: uuidv4(),
      container_id: containerId,
      resource_id: resourceId,
      resource_option_name: option.key,
      container_env_name: option.value,
    })));
  }

  static async getContainersOfResource(resourceId: string):Promise<(ContainerTable)[]> {
    return knex<ContainerTable>('container').select('container.*')
      .leftJoin('container_resource', 'container.id', 'container_resource.container_id')
      .where('container_resource.resource_id', resourceId);
  }

  static async getEnvOfContainer(containerId: string):Promise<ContainerResourceEnvOptionTable[]> {
    return knex<ContainerResourceEnvOptionTable>('container_resource_env_option')
      .select('container_resource_env_option.*')
      .where('container_resource_env_option.container_id', containerId);
  }

  static async getResourcesOfContainer(containerId: string):Promise<(ResourceTable)[]> {
    return knex<ResourceTable>('resource').select('resource.*')
      .leftJoin('container_resource', 'resource.id', 'container_resource.resource_id')
      .leftJoin('container', 'container.id', 'container_resource.container_id')
      .where('container_resource.container_id', containerId);
  }
          
}

export default ResourceModel;