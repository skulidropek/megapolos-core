/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

export interface IEntity {
  id: string;
  create_date: Date;
  update_date: Date;
}

export interface DriverMysqlDatabaseTable {
  id: string;
  user_id: string;
  name: string;
  login: string;
  password: string;
}
export interface AppInstanceTable extends IEntity {
  id: string;
  name: string;
  user_id: string;
  life_status: string;
  app_instance_url: string;
  app_id: string;
  instance_type_id: string;
  deploy_strategy_id: string;
  remove_strategy_id: string;
  create_date: Date;
  update_date: Date;
  remove_date: Date;
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
export interface NodeTable extends IEntity {
  id: string;
  name: string;
  host: string;
  cpu: string;
  memory: string;
  user: string;
  password: string;
  life_status: string;
  docker_mirrors: string[];
  create_date: Date;
  update_date: Date;
  remove_date: Date;
  last_update_date: Date;
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
  create_date: Date;
  update_date: Date;
  remove_date: Date;
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
export interface UserTable extends IEntity {
  id: string;
  name: string;
  group_user_id: string;
  rest_api: string;
  user_status: string;
  create_date: Date;
  update_date: Date;
  disable_date: Date;
  os_user_id: string;
}
export interface GroupUserTable {
  id: string;
  name: string;
  rest_api: string;
  create_date: Date;
  update_date: Date;
  disable_date: Date;
}
export interface GroupUserPrivilegeTable {
  id: string;
  group_user_id: string;
  object_name: string;
  object_id: string;
  action: string;
  create_date: Date;
  update_date: Date;
}
export interface AppTable {
  id: string;
  name: string;
  owner_user_id: string;
  status: string;
  create_date: Date;
  update_date: Date;
}
export interface GroupUserTable {
  id: string;
  name: string;
  rest_api: string;
  create_date: Date;
  update_date: Date;
  disable_date: Date;
}
export enum ImageStatus {
  NotExist = 'not_exist',
  Building = 'building',
  Built = 'built',
}
export interface ImageTable {
  id: string;
  name: string;
  app_id: string;
  image: string;
  inner_port: number;
  has_state: number;
  tags: string;
  create_date: Date;
  update_date: Date;
  commit_id: string;
  repository_id: string;
  branch: string;
  status: ImageStatus;
  last_build_date: Date;
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
  create_date: Date;
  update_date: Date;
  remove_date: Date;
  domain_id: string;
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
  create_date: Date;
  update_date: Date;
  remove_date: Date;
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
  create_date: Date,
  update_date: Date,
  remove_date: Date,
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

export enum ImageEnvRequirementType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Password = 'password',
}

export interface ImageEnvRequirementTable {
  id: string,
  image_id: string,
  name: string,
  env_name: string,
  env_default_value: string,
  type: ImageEnvRequirementType
}

export interface ImageVariableRequirementTable {
  id: string,
  image_id: string,
  title: string,
  name: string,
  default_value: string,
  type: ImageEnvRequirementType,
}

export interface ContainerVariableTable {
  id: string,
  container_id: string,
  name: string,
  type: ImageEnvRequirementType,
  value: string,
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

export enum RepositoryType {
  Microservice = 'microservice',
  Test = 'test',
}

export interface RepositoryTable {
  id: string,
  url: string,
  user: string,
  name: string,
  password: string,
  create_date: Date,
  update_date: Date,
  remove_date: Date,
  last_fetch_date: Date,
  app_id: string,
  microservice_name: string,
  type: RepositoryType,
}

export interface DomainTable {
  id: string,
  name: string,
  auth: string,
  user: string,
  password: string,
  create_date: Date,
  update_date: Date,
  remove_date: Date,
}

export interface DbmsTable {
  id: string,
  name: string,
  user: string,
  password: string,
  host: string,
  type: string,
  create_date: Date,
  update_date: Date,
}

export interface DbTable {
  id: string,
  name: string,
  create_date: Date,
  update_date: Date,
  dbms_id: string,
}

export interface DbUserTable {
  id: string,
  name: string,
  create_date: Date,
  update_date: Date,
  dbms_id: string,
  password: string,
}

export interface DbBackupTable {
  id: string,
  name: string,
  create_date: Date,
  update_date: Date,
  artifact_id: string,
  type: string,
}

export interface DbDbUserTable {
  db_id: string,
  db_user_id: string,
}

export interface ArtifactTable {
  id: string,
  name: string,
  type: string,
  create_date: Date,
  update_date: Date,
}

export enum LogType {
  ImageBuild = 'image_build',
  NodeUpdate = 'node_update',
  NodeInit = 'node_init',
  NodeInstallRegistry = 'node_install_registry',
  TestRun = 'test_run',
  NodePrepareForCore = 'node_prepare_for_core',
  DbBackup = 'db_backup',
  DbRestore = 'db_restore',
}

export interface LogTable {
  id: string,
  name: string,
  container_id: string,
  container_name: string,
  node_id: string,
  node_name: string,
  object_id: string,
  object_name: string,
  type: LogType,
  create_date: Date,
  update_date: Date,
  is_closed: boolean,
  close_date: Date,
}

export interface DbSchemaSchemaField {
  name: string,
  type: string,
  notNull: boolean,
  unique: boolean,
  primaryKey: boolean,
}

export interface DbSchemaSchemaForeignKey {
  name: string,
  field: string,
  foreignTable: string,
  foreignField: string,
}

export interface DbSchemaSchemaTable {
  name: string,
  fields: DbSchemaSchemaField[],
  foreignKeys: DbSchemaSchemaForeignKey[],
}

export interface DbSchemaSchema {
  tables: DbSchemaSchemaTable[]
}

export interface DbSchemaTable {
  id: string,
  schema: DbSchemaSchema,
  name: string,
  create_date: Date,
  update_date: Date,
}

export interface VolumeBackupTable {
  id: string,
  name: string,
  create_date: Date,
  update_date: Date,
  artifact_id: string,
}

export interface ContainerDbTable extends IEntity {
  container_id: string,
  db_id: string,
  db_user_id: string,
  name: string,
}