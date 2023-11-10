import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import fsSync from 'fs';
import docker from '../coreDocker';
import BaseDevice from '../modules/devices/baseDevice';
import AppInstanceModel from '../modules/models/appInstance.model';
import { ContainerInput } from '../types';
import App from './App';
import Container from './Container';
import Image from './Image';
import Instance from './Instance';
import MegapolosNode from './Node';
import Volume from './Volume';
import { AppInstanceTable, AppTable, ImageTable, UserTable } from '../modules/models/tables';
import User from './User';
import DatabaseDevice from '../modules/devices/databaseDevice';
import RepositoryDevice from '../modules/devices/repositoryDevice';
import BuilderDevice from '../modules/devices/builderDevice';
import EventsObserver from '../modules/events/eventsObserver';
import BaseDeviceWithType from '../modules/devices/BaseDeviceWithType';

const isWsl = require('is-wsl');

class ContainerCreate {
  container:Container;

  image:Image;

  imageData: ImageTable;

  input: ContainerInput;

  instance:Instance;

  instanceData: AppInstanceTable;

  app:App;

  appData: AppTable;

  user:User;

  userData: UserTable;

  async create(instance: Instance, image: Image, input: ContainerInput): Promise<Container> {
    this.instance = instance;
    this.instanceData = await instance.getData();
    this.input = input;
    this.image = image;
    this.imageData = await image.getData();
    this.app = await image.getApp();
    this.appData = await this.app.getData();
    this.user = await this.instance.getUser();
    this.userData = await this.user.getData();

    await this.pullImage();
    await this.createContainer();
    await this.addDevices();
    await this.addVolumes();
    await this.addEnvs();
    await this.build(this.container, false);
    return this.container;
  }
  
  async pullImage() {
    try {
      docker.getImage(this.imageData.image);
    } catch {
      await docker.pull(this.imageData.image);
    }
  }

  async createContainer() {
    const containerId = uuidv4();
    let outerPort = await MegapolosNode.currentNode.getPort();
    if (this.input) {
      if (this.input.fixed_outer_port) {
        MegapolosNode.currentNode.checkPort(this.input.fixed_outer_port);
        outerPort = this.input.fixed_outer_port;
      }
    }
    await AppInstanceModel.createContainer({
      id: containerId,
      docker_runtime_id: '',
      name: this.appData.name + '_' + this.instanceData.name + '_' + this.imageData.name,
      image_id: this.image.id,
      node_id: '',
      outer_port: outerPort,
      app_instance_id: this.instance.id,
    });
    this.container = new Container(containerId);
  }

  async addDevices() {
    if (this.input) {
      for (let j in this.input.devices) {
        const deviceInput = this.input.devices[j];
        const device = BaseDeviceWithType.getDeviceWithType(deviceInput.id);
        await (await device).addToContainer(this.container.id, deviceInput);
      }
    }
  }

  async addVolumes() {
    for (let i in this.input.volumes) {
      const volumeInput = this.input.volumes[i];
      const volume = new Volume(volumeInput.volume);
      await volume.addToContainer(this.container, volumeInput);
    }
  }

  async addEnvs() {
    for (let i in this.input.envs) {
      const env = this.input.envs[i];
      const envId = uuidv4();
      await AppInstanceModel.addContainerEnvOption({
        id: envId,
        container_id: this.container.id,
        container_env_name: env.key,
        container_env_value: env.value,
      });
    }
  }

  async build(container: Container, noRebuild:boolean) {
    if (!this.container) {
      this.container = container;
      this.image = await container.getImage();
      this.imageData = await this.image.getData();
      this.app = await this.image.getApp();
      this.appData = await this.app.getData();
      this.instance = await container.getInstance();
      this.instanceData = await this.instance.getData();
      this.user = await this.instance.getUser();
      this.userData = await this.user.getData();
    }

    this.buildContainer(noRebuild);
  }

  async buildContainer(noRebuild: boolean):Promise<void> {
    const allEnvs = await this.getContainerEnvs();

    const repositoryDevice:RepositoryDevice = await this.container.getDeviceOfType('repository') as unknown as RepositoryDevice;
    const builderDevice:BuilderDevice = await this.container.getDeviceOfType('builder') as unknown as BuilderDevice;
    if (builderDevice && !noRebuild) {
      if (repositoryDevice) {
        const repository = await repositoryDevice.cloneContainer(this.container.id);
        await builderDevice.buildPath(this.container.id, this.imageData.image, repository.path, allEnvs);
    
        MegapolosNode.currentNode.validatePath(repository.path);
        if (fsSync.existsSync(repository.path)
        ) {
          fs.rmdir(repository.path, { recursive: true });
        }
      } else {
        await builderDevice.buildContainer(this.container.id, this.imageData.image, allEnvs);
      }
      this.container.updateLifeStatus('building');
    } else {
      try {
        await docker.getImage(this.imageData.image).inspect();
      } catch {
        await docker.pull(this.imageData.image);
      }
      await EventsObserver.listener({
        type: 'buildEnded',
        data: {
          containerId: this.container.id,
        },
      });
    }

    EventsObserver.listener({ 'type': 'createContainer', id: this.container.id });
  }

  async createContainerAfterBuild(container: Container) {
    if (!this.container) {
      this.container = container;
      this.image = await container.getImage();
      this.imageData = await this.image.getData();
      this.app = await this.image.getApp();
      this.appData = await this.app.getData();
      this.instance = await container.getInstance();
      this.instanceData = await this.instance.getData();
      this.user = await this.instance.getUser();
      this.userData = await this.user.getData();
    }

    const containerData = await this.container.getData();

    this.container.updateLifeStatus('stopped');

    const megapolosVolume = MegapolosNode.currentNode.getMegapolosPath() + '/volumes/' + this.container.id;
    MegapolosNode.currentNode.validatePath(megapolosVolume);

    if (!fsSync.existsSync(megapolosVolume)) {
      await fs.mkdir(megapolosVolume);
    }

    const containerVolumes = await Promise.all((await this.container.getVolumes()).map(async (_containerVolume) => ({
      containerVolume: _containerVolume.containerVolume, volume: await _containerVolume.volume.getData(), 
    })));

    const allEnvs = await this.getContainerEnvs();

    console.log(allEnvs.map((env) => env.key + '=' + env.value));

    const portBindings = [{ 
      HostIp: '127.0.0.1',
      HostPort: containerData.outer_port.toString(),
    }];
    // if (!isWsl) {
    portBindings.push({
      HostIp: '172.17.0.1',
      HostPort: containerData.outer_port.toString(),
    });
    // }

    EventsObserver.listener({ 'type': 'createContainerAfterBuild', id: this.container.id });
    const dockerContainer = await (docker.createContainer({
      name: (this.container.id + '_' + this.imageData.name).replace(/[^a-zA-Z0-9]/g, ''),
      Image: this.imageData.image,
      Env: allEnvs.filter((env) => env.key !== '' && env.value !== '').
        map((env) => env.key + '=' + env.value),
      ExposedPorts: {
        [`${this.imageData.inner_port}/tcp`]: {},
      },
      HostConfig: {
        // ExtraHosts: isWsl ? undefined : ['host.docker.internal:host-gateway'],
        ExtraHosts: ['host.docker.internal:host-gateway'],
        PortBindings: {
          [this.imageData.inner_port + '/tcp']: portBindings,
        },
        Binds: [
          megapolosVolume + ':/megapolos:rw,rshared',
          ...containerVolumes
            .filter((volume) => !volume.containerVolume.is_dynamic)
            .map((volume) => volume.volume.outer_path + ':' + volume.containerVolume.inner_path),
        ],
      },
    }));

    await this.container.updateDockerRuntimeId(dockerContainer.id);

    return dockerContainer;
  }
  
  async getContainerEnvs():Promise<{ key: string, value: string }[]> {
    const devices = await this.container.getDevices();

    const envParameters = await this.container.getDevicesEnvs();
    let deviceParameters:{ key: string, value: string }[] = [];
  
    for (let i in devices) {
      const device = devices[i];
      let deviceOptions: { key: string, value: string }[] = (await device.getContainerAuxOptions(this.container.id))
        .map((option) => ({ key: option.device_option_name, value: option.container_option_value }));
      if ((await device.getData()).device_type_id === 'db') {
        const dbDevice = new DatabaseDevice(device.id);
        const dbOptions = await dbDevice.getDbOptionsOfContainer(this.container.id);
        ['db_host', 'db_user', 'db_password', 'db_name', 'db_protocol'].forEach((key) => {
          deviceOptions.push({
            key: key,
            value: dbOptions[key],
          });
        });
      }
      deviceParameters = deviceParameters.concat(deviceOptions);
    }

    console.log(deviceParameters);

    const containerDevice = await this.container.getDeviceOfDriver();
    const containerDeviceData = await containerDevice?.getData();
  
    const envs = await this.container.getEnvs();

    const result = [
      { key: 'MEGAPOLOS', value: '1' },
      { key: 'MEGAPOLOS_TOKEN', value: this.user.createToken() },
      { key: 'MEGAPOLOS_APP_ID', value: this.app.id },
      { key: 'MEGAPOLOS_DRIVER_ID', value: containerDeviceData?.driver_id || '' },
      { key: 'MEGAPOLOS_DEVICE_ID', value: containerDevice?.id || '' },
      { key: 'MEGAPOLOS_DEVICE_TYPE_ID', value: containerDeviceData?.device_type_id || '' },
      { key: 'MEGAPOLOS_APP_INSTANCE_ID', value: this.instance.id },
      { key: 'MEGAPOLOS_CONTAINER_ID', value: this.container.id },
      { key: 'MEGAPOLOS_IMAGE_ID', value: this.image.id },
      { key: 'MEGAPOLOS_PATH_DATA', value: MegapolosNode.currentNode.getMegapolosPath() + '/data' },
      { key: 'MEGAPOLOS_PATH_VOLUME', value: MegapolosNode.currentNode.getMegapolosPath() + '/volumes/' + this.container.id },
      ...envParameters.map((env) => ({ key: env.container_env_name, value: deviceParameters.find(option => option.key === env.device_option_name)?.value })),
      ...envs.map((env) => ({ key: env.container_env_name, value: env.container_env_value })),
    ];
    return result.filter((env) => env.key);
  }
}

export default ContainerCreate; 
