import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import fsSync from 'fs';
import docker from '../../coreDocker';
import { AppInstanceInput } from '../../types';
import { megapolosPath } from '../../index';
import AppModel from '../models/app.model';
import AppInstanceModel from '../models/appInstance.model';
import UserModel from '../models/user.model';
import DeviceModel from '../models/device.model';
import BaseDevice from '../devices/baseDevice';
import DatabaseDevice from '../devices/databaseDevice';
import RepositoryDevice from '../devices/repositoryDevice';
import BuilderDevice from '../devices/builderDevice';
import UserAction from './user.action';
import EventsObserver from '../events/eventsObserver';
import DockerEvent from '../events/docker.event';

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
  
  static async createContainer(
    data: {
      containerId: string, imageId: string, imageName: string, imageRepository: string, userId: string,
      appId: string, appInstanceId: string, innerPort: number, outerPort: number
    },
  ) {
    const envParameters = await DeviceModel.getEnvOfContainer(data.containerId);
    let deviceParameters = {};
  
    const devices = await DeviceModel.getDevicesOfContainer(data.containerId);
    for (let i in devices) {
      const device = devices[i];
      const deviceObject = new BaseDevice(device.outer_port);
      const result = await deviceObject.getEnvFieldsValues(data.userId);
      deviceParameters = { ...result };
    }
  
    const repositoryDevice = devices.find((device) => device.device_type_id === 'repository');
    const builderDevice = devices.find((device) => device.device_type_id === 'builder');
    if (builderDevice) {
      const builderDeviceObject = new BuilderDevice(builderDevice.outer_port);
      if (repositoryDevice) {
        const repositoryDeviceObject = new RepositoryDevice(repositoryDevice.outer_port);
        const repository = await repositoryDeviceObject.cloneContainer(data.containerId);
        const builderDeviceObject = new BuilderDevice(builderDevice.outer_port);
        await builderDeviceObject.build(data.imageName, repository.path);
    
        if (repository.path.startsWith(megapolosPath + '/data/') &&
          fsSync.existsSync(repository.path)
        ) {
          fs.rmdir(repository.path, { recursive: true });
        }
      } else {
        await builderDeviceObject.buildLocal(data.containerId, data.imageName);
      }
    }
  
    const containerDevice = await DeviceModel.getDeviceFromContainer(data.containerId);
  
    const megapolosVolume = megapolosPath + '/volumes/' + data.containerId;

    if (!fsSync.existsSync(megapolosVolume)) {
      await fs.mkdir(megapolosVolume);
    }
    return (docker.createContainer({
      name: data.containerId + '_' + data.imageName,
      Image: data.imageRepository,
      Env: [
        'MEGAPOLOS=1',
        'MEGAPOLOS_TOKEN=' + UserAction.createToken(data.userId),
        'MEGAPOLOS_APP_ID=' + data.appId,
        'MEGAPOLOS_DRIVER_ID=' + containerDevice?.driver_id || '',
        'MEGAPOLOS_DEVICE_ID=' + containerDevice?.device_id || '',
        'MEGAPOLOS_DEVICE_TYPE_ID=' + containerDevice?.device_type_id || '',
        'MEGAPOLOS_APP_INSTANCE_ID=' + data.appInstanceId,
        'MEGAPOLOS_CONTAINER_ID=' + data.containerId,
        'MEGAPOLOS_IMAGE_ID=' + data.imageId,
        'MEGAPOLOS_PATH_DATA=' + megapolosPath + '/data',
        ...envParameters.map((env) => env.container_env_name + '=' + deviceParameters[env.device_option_name]),
      ],
      ExposedPorts: {
        [`${data.innerPort}/tcp`]: {},
      },
      HostConfig: {
        PortBindings: {
          [data.innerPort + '/tcp']: [{ 
            HostIp: '',
            HostPort: data.outerPort.toString(),
          }],
        },
        Binds: [megapolosVolume + ':/megapolos'],
      },
    }));
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
      const outerPort = await AppInstanceAction.getPort();
      try {
        docker.getImage(image.repository);
      } catch {
        await docker.pull(image.repository);
      }
      if (input.containers[image.id]) {
        for (let deviceId in input.containers[image.id].devices) {
          const containerDeviceId = uuidv4();
          const deviceInput = input.containers[image.id].devices[deviceId];
          await DeviceModel.addDeviceToContainer({
            containerDeviceId,
            containerId,
            deviceId,
          });
  
          const deviceContainer = await DeviceModel.getDeviceContainer(deviceId);
          if (deviceContainer.device_type_id === 'db') {
            const databaseDevice = new DatabaseDevice(deviceContainer.outer_port);
            await databaseDevice.add(userId);
          // const deviceOptions = await fetch(`http://localhost:${deviceContainer.outer_port}/app_options_env/get`, {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //   },
          //   body: JSON.stringify({
          //     user_id: userId,
          //   }),
          // });
          }
  
          if (deviceInput.env_parameters) {
            for (let envId in deviceInput.env_parameters) {
              const containerDeviceEnvId = uuidv4();
              await DeviceModel.addEnvToContainer({
                id: containerDeviceEnvId,
                container_id: containerId,
                device_id: deviceId,
                device_option_name: envId,
                container_env_name: deviceInput.env_parameters[envId],            
              });
            }
          }
          if (deviceInput.parameters) {
            for (let optionName in deviceInput.parameters) {
              const containerDeviceEnvId = uuidv4();
              await DeviceModel.addOptionToContainer({
                id: containerDeviceEnvId,
                container_id: containerId,
                device_id: deviceId,
                device_option_name: optionName,
                container_option_value: deviceInput.parameters[optionName],
              });
            }
          }
        }
      }
  
      const dockerRuntimeId = (await AppInstanceAction.createContainer({
        containerId, imageId: image.id, imageName: image.name,
        imageRepository: image.repository,
        userId, appId: input.app_id, appInstanceId, innerPort: image.inner_port, outerPort })).id;
      await AppInstanceModel.createContainer({
        id: containerId,
        docker_runtime_id: dockerRuntimeId,
        name: app.name + '_' + input.name + '_' + image.name,
        image_id: image.id,
        node_id: '',
        outer_port: outerPort,
        app_instance_id: appInstanceId,
      });
    }
  
    return appInstanceId;
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
    
      await AppInstanceModel.deleteContainer(container.id);
      const devices = await DeviceModel.getDevicesOfContainer(container.id);
      for (let i in devices) {
        const device = devices[i];
        if (device.device_type_id === 'db') {
          const databaseDevice = new DatabaseDevice(device.outer_port);
          await databaseDevice.remove(instance.user_id);
        }
      }
      await DeviceModel.removeDevicesFromContainer(container.id);
      await DeviceModel.removeEnvsFromContainer(container.id);
      await DeviceModel.removeOptionsFromContainer(container.id);
    }
    await AppInstanceModel.removeAppInstance(appInstanceId);
    await UserModel.removeUser(instance.user_id);
  
    if (isDevice) {
      try {
        await exec(`userdel -r ${instance.user_id.replace(/-/g, '')}`);
      } catch(e) {
        console.error(e);
      }
    }
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
  }

  static async restoreContainers() {
    const containers = await AppInstanceModel.getContainers();
    for (let i in containers) {
      const container = containers[i];
      try {
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
  }
}

export default AppInstanceAction;