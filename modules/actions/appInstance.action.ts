import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import fsSync from 'fs';
import docker from '../../coreDocker';
import { AppInstanceInput, ContainerDeviceInput, ContainerVolumeInput } from '../../types';
import { megapolosPath } from '../../index';
import AppModel from '../models/app.model';
import AppInstanceModel from '../models/appInstance.model';
import UserModel from '../models/user.model';
import DeviceModel from '../models/device.model';
import BaseDevice from '../devices/baseDevice';
import DatabaseDevice from '../devices/databaseDevice';
import RepositoryDevice from '../devices/repositoryDevice';
import BuilderDevice from '../devices/builderDevice';
import DomainDevice from '../devices/domainDevice';
import UserAction from './user.action';
import EventsObserver from '../events/eventsObserver';
import DockerEvent from '../events/docker.event';
import VolumeModel from '../models/volume.model';
import CertificateDevice from '../devices/certificateDevice';

const exec =   promisify(require('child_process').exec);

class AppInstanceAction {
  static async getPort() {
    const usedPorts = (await AppInstanceModel.getUsedPorts()).map((app) => app.outer_port);
    for (let i = 10000; i < 20000; i++) {
      if (!usedPorts.includes(i)) {
        return i;
      }
    }
    throw new Error('No available port');
  }

  static async checkPort(port: number) {
    const usedPorts = (await AppInstanceModel.getUsedPorts()).map((app) => app.outer_port);
    if (usedPorts.includes(port)) {
      throw new Error('No available port');
    }
    return true; 
  }
  
  static async createContainer(
    data: {
      containerId: string, imageId: string, imageName: string, imageRepository: string, userId: string,
      appId: string, appInstanceId: string, innerPort: number, outerPort: number
    },
  ):Promise<void> {
    const allEnvs = await AppInstanceAction.getContainerEnvs({
      containerId: data.containerId,
      userId: data.userId,
      appId: data.appId,
      appInstanceId: data.appInstanceId,
      imageId: data.imageId,
    });

    const devices = await DeviceModel.getDevicesOfContainer(data.containerId);
    const repositoryDevice = devices.find((device) => device.device_type_id === 'repository');
    const builderDevice = devices.find((device) => device.device_type_id === 'builder');
    if (builderDevice) {
      const builderDeviceContainer = await DeviceModel.getDeviceDriverContainer(builderDevice.id);
      const builderDeviceObject = new BuilderDevice(builderDeviceContainer.outer_port);
      if (repositoryDevice) {
        const repositoryDeviceContainer = await DeviceModel.getDeviceDriverContainer(repositoryDevice.id);
        const repositoryDeviceObject = new RepositoryDevice(repositoryDeviceContainer.outer_port);
        const repository = await repositoryDeviceObject.cloneContainer(data.containerId);
        await builderDeviceObject.buildPath(data.containerId, data.imageName, repository.path, allEnvs);
    
        if (repository.path.startsWith(megapolosPath + '/data/') &&
          fsSync.existsSync(repository.path)
        ) {
          fs.rmdir(repository.path, { recursive: true });
        }
      } else {
        await builderDeviceObject.buildContainer(data.containerId, data.imageName, allEnvs);
      }
      await AppInstanceModel.updateContainerLifeStatus(data.containerId, 'building');
    } else {
      try {
        await docker.getImage(data.imageRepository).inspect();
      } catch {
        await docker.pull(data.imageRepository);
      }
      await EventsObserver.listener({
        type: 'buildEnded',
        data: {
          containerId: data.containerId,
        },
      });
    }

    EventsObserver.listener({ 'type': 'createContainer', data });
  }

  static async getContainerEnvs(data: { containerId: string, userId: string, appId: string, appInstanceId: string, imageId: string }) {
    const devices = await DeviceModel.getDevicesOfContainer(data.containerId);

    const envParameters = await DeviceModel.getEnvOfContainer(data.containerId);
    let deviceParameters:{ key: string, value: string }[] = [];
  
    for (let i in devices) {
      const device = devices[i];
      const deviceDriverContainer = await DeviceModel.getDeviceDriverContainer(device.id);
      const deviceObject = new BaseDevice(deviceDriverContainer.outer_port);
      let deviceOptions: {key: string, value: string}[] = (await DeviceModel.getDeviceAuxOptionsOfContainer(data.containerId, device.id))
      .map((option) => ({ key: option.device_option_name, value: option.container_option_value }));
      if (device.device_type_id === 'db') {
        const dbOptions = await DeviceModel.getDeviceDbOptionsOfContainer(device.id, data.containerId);
        ['db_host', 'db_user', 'db_password', 'db_name', 'db_protocol'].forEach((key) => {
        deviceOptions.push({
          key: key,
          value: dbOptions[key]
        })
        });
      }
      deviceParameters = deviceParameters.concat(deviceOptions);
    }

    console.log(deviceParameters);

    const containerDevice = await DeviceModel.getDeviceFromContainer(data.containerId);
  
    const envs = await AppInstanceModel.getContainerEnvOptions(data.containerId);

    const result = [
      { key: 'MEGAPOLOS', value: '1' },
      { key: 'MEGAPOLOS_TOKEN', value: UserAction.createToken(data.userId) },
      { key: 'MEGAPOLOS_APP_ID', value: data.appId },
      { key: 'MEGAPOLOS_DRIVER_ID', value: containerDevice?.driver_id || '' },
      { key: 'MEGAPOLOS_DEVICE_ID', value: containerDevice?.id || '' },
      { key: 'MEGAPOLOS_DEVICE_TYPE_ID', value: containerDevice?.device_type_id || '' },
      { key: 'MEGAPOLOS_APP_INSTANCE_ID', value: data.appInstanceId },
      { key: 'MEGAPOLOS_CONTAINER_ID', value: data.containerId },
      { key: 'MEGAPOLOS_IMAGE_ID', value: data.imageId },
      { key: 'MEGAPOLOS_PATH_DATA', value: megapolosPath + '/data' },
      { key: 'MEGAPOLOS_PATH_VOLUME', value: megapolosPath + '/volumes/' + data.containerId },
      ...envParameters.map((env) => ({ key: env.container_env_name, value: deviceParameters.find(option => option.key === env.device_option_name)?.value })),
      ...envs.map((env) => ({ key: env.container_env_name, value: env.container_env_value })),
    ];
    return result.filter((env) => env.key);
  }


  static async createContainerAfterBuild(
    data: {
      containerId: string, imageId: string, imageName: string, imageRepository: string, userId: string,
      appId: string, appInstanceId: string, innerPort: number, outerPort: number
    },
  ) {
    await AppInstanceModel.updateContainerLifeStatus(data.containerId, 'stopped');

    const megapolosVolume = megapolosPath + '/volumes/' + data.containerId;

    if (!fsSync.existsSync(megapolosVolume)) {
      await fs.mkdir(megapolosVolume);
    }

    const containerVolumes = await VolumeModel.getVolumesOfContainer(data.containerId);
    const volumes = await VolumeModel.getVolumes();

    const allEnvs = await AppInstanceAction.getContainerEnvs({
      containerId: data.containerId,
      userId: data.userId,
      appId: data.appId,
      appInstanceId: data.appInstanceId,
      imageId: data.imageId,
    });

    console.log(allEnvs.map((env) => env.key + '=' + env.value));

    EventsObserver.listener({ 'type': 'createContainerAfterBuild', data });
    return (docker.createContainer({
      name: data.containerId + '_' + data.imageName,
      Image: data.imageRepository,
      Env: allEnvs.filter((env) => env.key !== '' && env.value !== '').
      map((env) => env.key + '=' + env.value),
      ExposedPorts: {
        [`${data.innerPort}/tcp`]: {},
      },
      HostConfig: {
        PortBindings: {
          [data.innerPort + '/tcp']: [{ 
            HostIp: '127.0.0.1',
            HostPort: data.outerPort.toString(),
          }],
        },
        Binds: [
          megapolosVolume + ':/megapolos:rw,rshared',
          ...containerVolumes
          .filter((volume) => !volume.is_dynamic)
          .map((volume) => volumes.find((v) => v.id === volume.volume_id).outer_path + ':' + volume.inner_path),
        ],
      },
    }));
  }

  static async addDeviceToContainer(containerId: string, deviceId: string, 
    userId: string, deviceInput: ContainerDeviceInput) {
    const containerDeviceId = uuidv4();
    await DeviceModel.addDeviceToContainer({
      containerDeviceId,
      containerId,
      deviceId,
    });

    const deviceDriverContainer = await DeviceModel.getDeviceDriverContainer(deviceId);
    const device = await DeviceModel.getDevice(deviceId);
    const container = await AppInstanceModel.getContainer(containerId);
    const containerDevices = await DeviceModel.getDevicesOfContainer(containerId);
    if (device.device_type_id === 'db') {
      const databaseDevice = new DatabaseDevice(deviceDriverContainer.outer_port);
      await databaseDevice.add(containerId);
    }
    if (device.device_type_id === 'certificate') {
      const domainDevice = containerDevices.find((device) => device.device_type_id === 'domain');
      if (!domainDevice) {
        throw new Error('Domain device not found');
      }
      const domainDriverContainer = await DeviceModel.getDeviceDriverContainer(domainDevice.id);
      const certificateDevice = new CertificateDevice(deviceDriverContainer.outer_port);
      await certificateDevice.add(containerId);
      const domainDeviceObject = new DomainDevice(domainDriverContainer.outer_port);
      await domainDeviceObject.add(containerId, container.outer_port);
    }

    if (deviceInput.env_parameters) {
      for (let i in deviceInput.env_parameters) {
        const containerDeviceEnvId = uuidv4();
        await DeviceModel.addEnvToContainer({
          id: containerDeviceEnvId,
          container_id: containerId,
          device_id: deviceId,
          device_option_name: deviceInput.env_parameters[i].key,
          container_env_name: deviceInput.env_parameters[i].value,
        });
      }
    }
    if (deviceInput.parameters) {
      for (let i in deviceInput.parameters) {
        const containerDeviceEnvId = uuidv4();
        await DeviceModel.addAuxOptionToContainer({
          id: containerDeviceEnvId,
          container_id: containerId,
          device_id: deviceId,
          device_option_name: deviceInput.parameters[i].key,
          container_option_value: deviceInput.parameters[i].value,
        });
      }
    }

    console.log(await DeviceModel.getDeviceAuxOptionsOfContainer(deviceId, containerId));

    if (device.device_type_id === 'domain') {
      // const container = await AppInstanceModel.getContainer(containerId);
      // const domainDevice = new DomainDevice(deviceDriverContainer.outer_port);
      // await domainDevice.add(containerId, container.outer_port);
    }
    if (device.device_type_id === 'certificate') {
      const certificateDevice = new CertificateDevice(deviceDriverContainer.outer_port);
      try {
        await certificateDevice.add(containerId);
      } catch (e) {
        console.error(e);
      }
    }

    EventsObserver.listener({ 'type': 'addDeviceToContainer', data: { containerId, deviceId } });
  }

  static async updateDeviceToContainer(containerId: string, deviceId: string, deviceInput: ContainerDeviceInput) {
    await DeviceModel.removeOptionsOfDeviceFromContainer({ containerId, deviceId });
    if (deviceInput.env_parameters) {
      for (let i in deviceInput.env_parameters) {
        const containerDeviceEnvId = uuidv4();
        await DeviceModel.addEnvToContainer({
          id: containerDeviceEnvId,
          container_id: containerId,
          device_id: deviceId,
          device_option_name: deviceInput.env_parameters[i].key,
          container_env_name: deviceInput.env_parameters[i].value,
        });
      }
    }
    if (deviceInput.parameters) {
      for (let i in deviceInput.parameters) {
        const containerDeviceEnvId = uuidv4();
        await DeviceModel.addAuxOptionToContainer({
          id: containerDeviceEnvId,
          container_id: containerId,
          device_id: deviceId,
          device_option_name: deviceInput.parameters[i].key,
          container_option_value: deviceInput.parameters[i].value,
        });
      }
    }

    EventsObserver.listener({ 'type': 'updateDeviceToContainer', data: { containerId, deviceId } });
  }

  static async removeDeviceFromContainer(containerId: string, deviceId: string) {
    const deviceDriverContainer = await DeviceModel.getDeviceDriverContainer(deviceId);
    const device = await DeviceModel.getDevice(deviceId);
    const container = await AppInstanceModel.getContainer(containerId);
    const instance = await AppInstanceModel.getAppInstance(container.app_instance_id);
    if (device.device_type_id === 'db') {
      const databaseDevice = new DatabaseDevice(deviceDriverContainer.outer_port);
      await databaseDevice.remove(containerId);
    }
    if (device.device_type_id === 'certificate') {
      const certificateDevice = new CertificateDevice(deviceDriverContainer.outer_port);
      try {
        await certificateDevice.remove(containerId);
      } catch (e) {
        console.error(e);
      }
    }
    if (device.device_type_id === 'domain') {
      const domainDevice = new DomainDevice(deviceDriverContainer.outer_port);
      await domainDevice.remove(containerId);
    }
    await DeviceModel.removeDeviceFromContainer({
      containerId: containerId,
      deviceId: deviceId,
    });
  }
  
  static async createAppInstance(input: AppInstanceInput, isDevice = false) {
    const appInstanceId = uuidv4();
    const userId = uuidv4();
  
    const app = await AppModel.getApp(input.app_id);
    const images = await AppModel.getImagesOfApp(input.app_id);
  
    let linuxUserId = '';
    if (isDevice) {
      await exec(`useradd -m -s /bin/bash ${userId.replace(/-/g, '')}`);
      linuxUserId = (await exec('cat /etc/passwd')).stdout.
        split('\n').
        filter((user) => user.startsWith(userId.replace(/-/g, ''))).
        join('\n').
        split(':')[2];
    }
  
    await UserModel.createUser({
      id: userId,
      name: input.name,
      groupUserId: isDevice ? 'device' : 'app',
      osUserId: linuxUserId,
    });
  
    await AppInstanceModel.createAppInstance({
      id: appInstanceId,
      name: input.name,
      user_id: userId,
      life_status: 'stopped',
      app_instance_url: input.name,
      app_id: input.app_id,
      instance_type_id: 'dev',
      deploy_strategy_id: '',
      remove_strategy_id: '',
    });
  
    for (let i in images) {
      const image = images[i];
      const containerId = uuidv4();
      let outerPort = await AppInstanceAction.getPort();
      try {
        docker.getImage(image.repository);
      } catch {
        await docker.pull(image.repository);
      }

      const imageContainer = input.containers.find((container) => container.image_id === image.id);
      if (imageContainer) {
        if (imageContainer.fixed_outer_port) {
          AppInstanceAction.checkPort(imageContainer.fixed_outer_port);
          outerPort = imageContainer.fixed_outer_port;
        }
        for (let j in imageContainer.devices) {
          const deviceInput = imageContainer.devices[j];
          await AppInstanceAction.addDeviceToContainer(containerId, deviceInput.id, userId, deviceInput);
        }
      }
  
      await AppInstanceModel.createContainer({
        id: containerId,
        docker_runtime_id: '',
        name: app.name + '_' + input.name + '_' + image.name,
        image_id: image.id,
        node_id: '',
        outer_port: outerPort,
        app_instance_id: appInstanceId,
      });

      for (let i in imageContainer.volumes) {
        const volume = imageContainer.volumes[i];
        AppInstanceAction.addVolumeToContainer(containerId, volume);
      }

      for (let i in imageContainer.envs) {
        const env = imageContainer.envs[i];
        const envId = uuidv4();
        await AppInstanceModel.addContainerEnvOption({
          id: envId,
          container_id: containerId,
          container_env_name: env.key,
          container_env_value: env.value,
        });
      }

      await AppInstanceAction.createContainer({
        containerId, imageId: image.id, imageName: image.repository,
        imageRepository: image.repository,
        userId, appId: input.app_id, appInstanceId, innerPort: image.inner_port, outerPort });
      // await AppInstanceModel.updateContainerDockerRuntimeId(containerId, dockerRuntimeId);
    }

    EventsObserver.listener({ 'type': 'createAppInstance', data: { appInstanceId } });
  
    return appInstanceId;
  }

  static async addVolumeToContainer(containerId: string, volumeInput: ContainerVolumeInput) {
    const volume = await VolumeModel.getVolume(volumeInput.volume);
    const volumeContainerId = uuidv4();
    if (volumeInput.is_dynamic) {
      const volumePath = megapolosPath + '/volumes/' + containerId + '/' + volumeContainerId;
      await fs.mkdir(volumePath);
      await exec(`mount --bind ${volume.outer_path} ${volumePath}`);
    }
    await VolumeModel.addVolumeToContainer({
      id: volumeContainerId,
      container_id: containerId,
      volume_id: volumeInput.volume,
      name: volumeInput.name,
      inner_path: volumeInput.is_dynamic ? '/megapolos/' + volumeContainerId : volumeInput.inner_path,
      is_dynamic: volumeInput.is_dynamic ? 1 : 0,
    });
    return VolumeModel.getVolumeOfContainer(containerId, volumeInput.volume);
  }

  static async removeVolumeFromContainer(containerId: string, volumeId: string) {
    const volumeContainer = await VolumeModel.getVolumeOfContainer(containerId, volumeId);
    if (volumeContainer.is_dynamic) {
      const volumePath = megapolosPath + '/volumes/' + containerId + '/' + volumeContainer.id;
      try {
        await exec(`umount ${volumePath}`);
      } catch (e) {
        console.error(e);
      }
      await fs.rmdir(volumePath);
    }
    await VolumeModel.removeVolumeFromContainer(containerId, volumeId);
  }
  
  static async startAppInstance(appInstanceId) {
    const instance = await AppInstanceModel.getAppInstance(appInstanceId);
    const containers = await AppInstanceModel.getAppInstanceContainers(appInstanceId);
    for (let i in containers) {
      const container = containers[i];
      try {
        await docker.getContainer(container.docker_runtime_id).start();
      } catch (e) {
        console.error(e);
      }
        
      await AppInstanceModel.updateContainerLifeStatus(container.id, 'running');
    }
    await AppInstanceModel.updateAppInstanceLifeStatus(appInstanceId, 'running');

    EventsObserver.listener({ 'type': 'startAppInstance', data:{ appInstanceId } });
  }
  
  static async stopAppInstance(appInstanceId) {
    const instance = await AppInstanceModel.getAppInstance(appInstanceId);
    const containers = await AppInstanceModel.getAppInstanceContainers(appInstanceId);
    for (let i in containers) {
      const container = containers[i];
      try {
        await docker.getContainer(container.docker_runtime_id).stop();
      } catch (e) {
        console.error(e);
      }
        
      await AppInstanceModel.updateContainerLifeStatus(container.id, 'stopped');
    }
    await AppInstanceModel.updateAppInstanceLifeStatus(appInstanceId, 'stopped');

    EventsObserver.listener({ 'type': 'stopAppInstance', data:{ appInstanceId } });
  }
  
  static async removeAppInstance(appInstanceId, isDevice = false) {
    const instance = await AppInstanceModel.getAppInstance(appInstanceId);
    const containers = await AppInstanceModel.getAppInstanceContainers(appInstanceId);
    for (let i in containers) {
      const container = containers[i];
      try {
        await docker.getContainer(container.docker_runtime_id).stop();
      } catch (e) {
        console.error(e);
      }
      try {
        await docker.getContainer(container.docker_runtime_id).remove();
      } catch (e) {
        console.error(e);
      }
      const megapolosVolume = megapolosPath + '/volumes/' + container.id;
      if (fsSync.existsSync(megapolosVolume)) {
        await fs.rmdir(megapolosVolume, { recursive: true });
      }
    
      const devices = await DeviceModel.getDevicesOfContainer(container.id);
      for (let i in devices) {
        const device = devices[i];
        AppInstanceAction.removeDeviceFromContainer(container.id, device.id);
      }
      await AppInstanceModel.deleteContainer(container.id);
    }
    await AppInstanceModel.removeAppInstance(appInstanceId);
    await UserModel.removeUser(instance.user_id);
  
    if (isDevice) {
      try {
        await exec(`userdel -r ${instance.user_id.replace(/-/g, '')}`);
      } catch (e) {
        console.error(e);
      }
    }

    EventsObserver.listener({ 'type': 'removeAppInstance', data:{ appInstanceId } });
  }

  static async dockerEvents() {
    docker.getEvents({}, function (err, data) {
      if (err) {
        console.error(err.message);
      } else {
        data.on('data', function (chunk) {
          EventsObserver.listener<DockerEvent>({
            type: 'DockerEvent',
            data: JSON.parse(chunk.toString('utf8')),
          });           
        });
      } 
    });

    EventsObserver.listener({ 'type': 'dockerEvents' });
  }

  static async restoreContainers() {
    const containers = await AppInstanceModel.getContainers();
    for (let i in containers) {
      const container = containers[i];
      try {
        if (!container.docker_runtime_id) {
          continue;
        }
        const containerInfo = await docker.getContainer(container.docker_runtime_id).inspect();
        if (container.life_status === 'running' && !containerInfo.State.Running) {
          try {
            await docker.getContainer(container.docker_runtime_id).start();
          } catch (e) {
            console.error(e);
          }
        }
        if (container.life_status === 'stopped' && containerInfo.State.Running) {
          try {
            await docker.getContainer(container.docker_runtime_id).stop();
          } catch (e) {
            console.error(e);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    EventsObserver.listener({ 'type': 'restoreContainers' });
  }
}

export default AppInstanceAction;