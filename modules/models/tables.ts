/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

export interface DriverMysqlDatabaseTable {
  id: string;
  user_id: string;
  name: string;
  login: string;
  password: string;
}
export interface AppInstanceTable {
  id: string;
  name: string;
  user_id: string;
  life_status: string;
  app_instance_url: string;
  app_id: string;
  instance_type_id: string;
  deploy_strategy_id: string;
  remove_strategy_id: string;
  create_date: string;
  update_date: string;
  remove_date: string;
}
export interface InstanceTypeTable {
  id: string;
  name: string;
}
export interface DeployStrategyTable {
  id: string;
  name: string;
}
export interface RemoveStrategyTable {
  id: string;
  name: string;
}
export interface NodeTable {
  id: string;
  name: string;
  url: string;
  cpu: string;
  memory: string;
  life_status: string;
  create_date: string;
  update_date: string;
  remove_date: string;
}
export interface DriverTable {
  id: string;
  name: string;
  app_id: string;
}
export interface DeviceTable {
  id: string;
  name: string;
  device_type_id: string;
  node_id: string;
  is_virtual: number;
  virtual_device_container_id: string;
  driver_id: string;
  url: string;
  life_status: string;
  backup_volume_id: string;
  create_date: string;
  update_date: string;
  remove_date: string;
}
export interface AppDeviceTable {
  id: string;
  app_id: string;
  device_id: string;
}
export interface AppInstanceDeviceTable {
  id: string;
  app_instance_id: string;
  device_id: string;
}
export interface UserTable {
  id: string;
  name: string;
  group_user_id: string;
  rest_api: string;
  user_status: string;
  create_date: string;
  update_date: string;
  disable_date: string;
  os_user_id: string;
}
export interface AppTable {
  id: string;
  name: string;
  owner_user_id: string;
  status: string;
  create_date: string;
  update_date: string;
}
export interface GroupUserTable {
  id: string;
  name: string;
  rest_api: string;
  create_date: string;
  update_date: string;
  disable_date: string;
}
export interface ImageTable {
  id: string;
  name: string;
  app_id: string;
  image: string;
  inner_port: number;
  has_state: number;
  tags: string;
  create_date: string;
  update_date: string;
  commit_id: string;
}
export interface ContainerDeviceEnvOptionTable {
  id: string;
  container_id: string;
  device_id: string;
  container_env_name: string;
  device_option_name: string;
}
export interface ContainerDeviceTable {
  id: string;
  container_id: string;
  device_id: string;
}
export interface ContainerTable {
  id: string;
  docker_runtime_id: string;
  name: string;
  image_id: string;
  node_id: string;
  outer_port: number;
  app_instance_id: string;
  life_status: string;
  create_date: string;
  update_date: string;
  remove_date: string;
}

export interface ContainerDeviceAuxOptionTable {
  id: string;
  container_id: string;
  device_id: string;
  device_option_name: string;
  container_option_value: string;
}

export interface ContainerDeviceDomainTable {
  id: string;
  container_id: string;
  device_id: string;
  domain: string;
  is_ssl: number;
}

export interface ContainerDeviceCertificateTable {
  id: string;
  container_id: string;
  device_id: string;
  private_key_path: string;
  public_key_path: string;
}

export interface ContainerDeviceDbTable {
  id: string;
  container_id: string;
  device_id: string;
  db_host: string;
  db_name: string;
  db_user: string;
  db_password: string;
  db_protocol: string;
}

export interface ContainerDeviceRepositoryTable {
  id: string;
  container_id: string;
  device_id: string;
  repository: string;
}

export interface VolumeTable {
  id: string;
  name: string;
  type: 'auto' | 'path' | 'dynamic_auto' | 'dynamic_path';
  outer_path: string;
  node_id: string;
  create_date: string;
  update_date: string;
  remove_date: string;
}

export interface ContainerVolumeTable {
  id: string,
  name: string,
  container_id: string,
  volume_id: string,
  inner_path: string,
  is_dynamic: number,
}

export interface ContainerEnvOptionTable {
  id: string,
  container_id: string,
  container_env_name: string,
  container_env_value: string,
}

export interface DeviceOptionTable {
  id: string,
  device_id: string,
  device_option_name: string,
  device_option_value: string,
}

export interface DeviceBackupTable {
  id: string,
  name: string,
  device_id: string,
  device_name: string,
  container_id: string,
  image_id: string,
  create_date: string,
  update_date: string,
  remove_date: string,
}

export interface ImageDeviceTable {
  id: string,
  image_id: string,
  device_id: string,
}

export interface ImageDeviceEnvOptionTable {
  id: string,
  image_id: string,
  device_id: string,
  image_env_name: string,
  device_option_name: string,
}

export interface ImageDeviceAuxOptionTable {
  id: string,
  image_id: string,
  device_id: string,
  device_option_name: string,
  image_option_value: string,
}

export interface ImageVolumeTable {
  id: string,
  name: string,
  image_id: string,
  inner_path: string,
  is_dynamic: number,
}

export interface ImageEnvOptionTable {
  id: string,
  image_id: string,
  image_env_name: string,
  image_env_value: string,
}

export interface ContainerResourceTable {
  id: string,
  container_id: string,
  resource_id: string,
}

export interface ImageResourceRequirementTable {
  id: string,
  image_id: string,
  resource_type: string,
  resource_kind: string,
}

export interface ImageVolumeRequirementTable {
  id: string,
  image_id: string,
  name: string,
  inner_path: string,
}

export interface ImageEnvRequirementTable {
  id: string,
  image_id: string,
  name: string,
  env_name: string,
  env_default_value: string,
}

export interface ResourceTable {
  id: string,
  device_id: string,
  name: string,
  resource_type: string,
  resource_kind: string,
}

export interface ResourceDomainTable {
  id: string,
  domain: string,
  is_ssl: number,
}

export interface ResourceCertificateTable {
  id: string,
  domain: string,
  private_key_path: string,
  public_key_path: string,
}

export interface ResourceDbTable {
  id: string,
  db_host: string,
  db_name: string,
  db_user: string,
  db_password: string,
  db_protocol: string,
}

export interface ResourceRepositoryTable {
  id: string,
  repository: string,
}

export interface ResourceDockerImageTable {
  id: string,
  image: string,
  tag: string,
  docker_id: string,
}

export interface ContainerResourceEnvOptionTable {
  id: string,
  container_id: string,
  resource_id: string,
  container_env_name: string,
  resource_option_name: string,
}

export interface ResourceDeviceAuxOptionTable {
  id: string,
  resource_id: string,
  device_id: string,
  device_option_name: string,
  resource_option_value: string,
}