import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import fetch from 'cross-fetch';
import coreRqlite from '../../coreRqlite';
import docker from '../../coreDocker';
import { AppInput, AppInstanceInput } from '../../types';
import { createToken, megapolosPath } from '../../index';
const exec = promisify(require('child_process').exec);

const getPort = async () => {
  let usedPorts = (await coreRqlite.query('SELECT outer_port FROM container')).toArray().map((app) => app.outer_port);
  for (let i = 10000; i < 20000; i++) {
    if (!usedPorts.includes(i)) {
      return i;
    }
  }
  throw new Error('No available port');
};

export const installApp = async (userId, input: AppInput) => {
  const appId = uuidv4();
    
  console.log(input);
  await coreRqlite.execute([[`
        INSERT INTO app (id, owner_user_id, name) 
        VALUES (?, ?, ?)
    `, appId, userId, input.name]]);
  for (let i in input.images) {
    const image = input.images[i];
    const imageId = uuidv4();
    await coreRqlite.execute([[`
        INSERT INTO image (id, name, app_id, repository, commit_id, inner_port)
        VALUES (?, ?, ?, ?, ?, ?)
      `, imageId, image.name, appId, image.repository, '', image.inner_port]]);
  }
  return appId;
};  

const createContainer = async (
  data: {
    containerId: string, imageId: string, imageName: string, imageRepository: string, userId: string,
    appId: string, appInstanceId: string, innerPort: number, outerPort: number
  },
) => {
  const envParameters = (await coreRqlite.query([[`
    SELECT * FROM container_device_env_option WHERE container_id = ?
  `, data.containerId]])).toArray();
  let deviceParameters = {};

  const devices = (await coreRqlite.query([[`
    SELECT c.*, d.id AS device_id, d.device_type_id AS device_type_id FROM device d
    JOIN container_device cd ON d.id = cd.device_id
    LEFT JOIN driver dr ON d.driver_id = dr.id
    LEFT JOIN app_instance ai ON dr.app_id = ai.app_id
    LEFT JOIN container c ON ai.id = c.app_instance_id
    WHERE cd.container_id = ?
  `, data.containerId]])).toArray();
  for (let i in devices) {
    const device = devices[i];
    const result = (await fetch(`http://localhost:${device.outer_port}/app_options_env/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: data.userId,
      }),
    }));
    deviceParameters = { ...await result.json() };
  }

  const repositoryDevice = devices.find((device) => device.device_type_id === 'repository');
  const builderDevice = devices.find((device) => device.device_type_id === 'builder');
  if (repositoryDevice && builderDevice) {
    const repositoryResult = await fetch(`http://localhost:${repositoryDevice.outer_port}/clone_container`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        container_id: data.containerId,
      }),
    });
    const repository = await repositoryResult.json();
    await fetch(`http://localhost:${builderDevice.outer_port}/build`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: data.imageName,
        path: repository.path,
      }),
    });
  }

  const containerDevice = (await coreRqlite.query([[`
  SELECT dr.id AS driver_id, d.id AS device_id, d.device_type_id AS device_type_id FROM device d
  LEFT JOIN driver dr ON d.driver_id = dr.id
  LEFT JOIN app_instance ai ON dr.app_id = ai.app_id
  LEFT JOIN container c ON ai.id = c.app_instance_id
  WHERE c.id = ?
`, data.containerId]])).toArray()[0];

  return (docker.createContainer({
    name: data.containerId + '_' + data.imageName,
    Image: data.imageRepository,
    Env: [
      'MEGAPOLOS=1',
      'MEGAPOLOS_TOKEN=' + createToken(data.userId),
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
    },
  }));
};

export const createAppInstance = async (input: AppInstanceInput, isDevice = false) => {
  const appInstanceId = uuidv4();
  const userId = uuidv4();

  const app = (await coreRqlite.query([[`
      SELECT * FROM app WHERE id = ?
    `, input.app_id]])).toArray()[0];
  const images = (await coreRqlite.query([[`
      SELECT * FROM image WHERE app_id = ?
    `, input.app_id]])).toArray();

  let linuxUserId = '';
  if (isDevice) {
    await exec(`useradd -m -s /bin/bash ${userId.replace(/-/g, '')}`);
    linuxUserId = (await exec('cat /etc/passwd')).stdout.
      split('\n').
      filter((user) => user.startsWith(userId.replace(/-/g, ''))).
      join('\n').
      split(':')[2];
  }

  await coreRqlite.execute([[`
      INSERT INTO user (id, name, group_user_id, os_user_id) VALUES (?, ?, ?, ?)
    `, userId, 'app_' + input.name, isDevice ? 'device' : 'app', linuxUserId]]);

  await coreRqlite.execute([[`
    INSERT INTO app_instance (id, name, user_id, life_status, app_instance_url, app_id, instance_type_id, deploy_strategy_id, remove_strategy_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, appInstanceId, input.name, userId, 'stopped', input.name, input.app_id, 'dev', '', '']]);

  for (let i in images) {
    const image = images[i];
    const containerId = uuidv4();
    const outerPort = await getPort();
    try {
      docker.getImage(image.repository);
    } catch {
      await docker.pull(image.repository);
    }
    if (input.containers[image.id]) {
      for (let deviceId in input.containers[image.id].devices) {
        const containerDeviceId = uuidv4();
        const deviceInput = input.containers[image.id].devices[deviceId];
        await coreRqlite.execute([[`
        INSERT INTO container_device (id, container_id, device_id)
        VALUES (?, ?, ?)
      `, containerDeviceId, containerId, deviceId]]);

        const deviceContainer = (await coreRqlite.query([[`
        SELECT c.*, d.device_type_id FROM device d
        LEFT JOIN driver dr ON d.driver_id = dr.id
        LEFT JOIN app_instance ai ON dr.app_id = ai.app_id
        LEFT JOIN container c ON ai.id = c.app_instance_id
        WHERE d.id = ?
        LIMIT 1
      `, deviceId]])).toArray()[0];
        if (deviceContainer.device_type_id === 'db') {
          await fetch(`http://localhost:${deviceContainer.outer_port}/databases/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
            }),
          });
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
            await coreRqlite.execute([[`
          INSERT INTO container_device_env_option (id, container_id, device_id, device_option_name, container_env_name)
          VALUES (?, ?, ?, ?, ?)
        `, containerDeviceEnvId, containerId, deviceId, envId, deviceInput.env_parameters[envId]]]);
          }
        }
        if (deviceInput.parameters) {
          for (let optionName in deviceInput.parameters) {
            const containerDeviceEnvId = uuidv4();
            await coreRqlite.execute([[`
          INSERT INTO container_device_option (id, container_id, device_id, device_option_name, container_option_value)
          VALUES (?, ?, ?, ?, ?)
        `, containerDeviceEnvId, containerId, deviceId, optionName, deviceInput.parameters[optionName]]]);
          }
        }
      }
    }

    const dockerRuntimeId = (await createContainer({
      containerId, imageId: image.id, imageName: image.name,
      imageRepository: image.repository,
      userId, appId: input.app_id, appInstanceId, innerPort: image.inner_port, outerPort })).id;
    await coreRqlite.execute([[`
        INSERT INTO container (id, docker_runtime_id, name, image_id, node_id, outer_port, app_instance_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, containerId, dockerRuntimeId, input.name, image.id, '', outerPort, appInstanceId]]);
  }

  return appInstanceId;
};

export const startAppInstance = async (appInstanceId) => {
  const instance = (await coreRqlite.query([['SELECT * FROM app_instance WHERE id = ?', appInstanceId]])).toArray()[0];
  const containers = (await coreRqlite.query([['SELECT * FROM container WHERE app_instance_id = ?', appInstanceId]])).toArray();
  for (let i in containers) {
    const container = containers[i];
    try {
      await docker.getContainer(container.docker_runtime_id).start();
    } catch (e) {
      console.error(e);
    }
      
    await coreRqlite.execute([['UPDATE container SET life_status = ? WHERE id = ?', 'running', container.id]]);
  }
  await coreRqlite.execute([[
    'UPDATE app_instance SET life_status = ? WHERE id = ?', 'running', appInstanceId]]);
};

export const stopAppInstance = async (appInstanceId) => {
  const instance = (await coreRqlite.query([['SELECT * FROM app_instance WHERE id = ?', appInstanceId]])).toArray()[0];
  const containers = (await coreRqlite.query([['SELECT * FROM container WHERE app_instance_id = ?', appInstanceId]])).toArray();
  for (let i in containers) {
    const container = containers[i];
    try {
      await docker.getContainer(container.docker_runtime_id).stop();
    } catch (e) {
      console.error(e);
    }
      
    await coreRqlite.execute([['UPDATE container SET life_status = ? WHERE id = ?', 'stopped', container.id]]);
  }
  await coreRqlite.execute([[
    'UPDATE app_instance SET life_status = ? WHERE id = ?', 'stopped', appInstanceId]]);
};

export const removeAppInstance = async (appInstanceId, isDevice = false) => {
  const instance = (await coreRqlite.query([['SELECT * FROM app_instance WHERE id = ?', appInstanceId]])).toArray()[0];
  const containers = (await coreRqlite.query([['SELECT * FROM container WHERE app_instance_id = ?', appInstanceId]])).toArray();
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
      
    await coreRqlite.execute([['DELETE FROM container WHERE id = ?', container.id]]);
    const devices = (await coreRqlite.query([[`
    SELECT c.*, d.id AS device_id, d.device_type_id AS device_type_id FROM device d
    JOIN container_device cd ON d.id = cd.device_id
    LEFT JOIN driver dr ON d.driver_id = dr.id
    LEFT JOIN app_instance ai ON dr.app_id = ai.app_id
    LEFT JOIN container c ON ai.id = c.app_instance_id
    WHERE cd.container_id = ?
  `, container.id]])).toArray();
    for (let i in devices) {
      const device = devices[i];
      if (device.device_type_id === 'db') {
        await fetch(`http://localhost:${device.outer_port}/databases/remove`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: instance.user_id,
          }),
        });
      }
    }
    await coreRqlite.execute([['DELETE FROM container_device WHERE container_id = ?', container.id]]);
    await coreRqlite.execute([['DELETE FROM container_device_env_option WHERE container_id = ?', container.id]]);
    await coreRqlite.execute([['DELETE FROM container_device_option WHERE container_id = ?', container.id]]);
  }
  await coreRqlite.execute([[
    'DELETE FROM app_instance WHERE id = ?', appInstanceId]]);
  await coreRqlite.execute([[
    'DELETE FROM user WHERE id = ?', instance.user_id]]);

  if (isDevice) {
    await exec(`userdel -r ${instance.user_id.replace(/-/g, '')}`);
  }
};

export const uninstallApp = async (appId) => {
  const images = (await coreRqlite.query([[`
    SELECT * FROM image WHERE app_id = ?
  `, appId]])).toArray();

  for (let i in images) {
    const image = images[i];
    await coreRqlite.execute([[`
      DELETE FROM image WHERE id = ?
    `, image.id]]);
  }

  await coreRqlite.execute([[
    'DELETE FROM app WHERE id = ?', appId]]);
};

const apps = (expressApp:Express) => {
  expressApp.post('/apps/list', async (req, res) => {
    try {
      const results = (await coreRqlite.query('SELECT * FROM app')).toArray();
      for (let i in results) {
        const images = (await coreRqlite.query([['SELECT * FROM image WHERE app_id = ?', results[i].id]])).toArray();
        results[i].images = images;
      }
      res.send(results);
    } catch (e) {
      console.error(e);
      res.status(400).send({
        error: e,
      });
    }
  });

  expressApp.post('/apps/instances/list', async (req, res) => {
    try {
      const results = (await coreRqlite.query('SELECT * FROM app_instance')).toArray();
      for (let i in results) {
        const containers = (await coreRqlite.query([['SELECT * FROM container WHERE app_instance_id = ?', results[i].id]])).toArray();
        results[i].containers = containers;
      }
      res.send(results);
    } catch (e) {
      console.error(e);
      res.status(400).send({
        error: e,
      });
    }
  });

  expressApp.post('/apps/install', async (req, res) => {
    try {
      const input = req.body as AppInput;
      await installApp(req.user.id, input);
      res.send({ 'result': 'ok' });
    } catch (e) {
      console.error(e);
      res.status(400).send({
        error: e,
      });
    }
  });

  expressApp.post('/apps/instances/create', async (req, res) => {
    try {
      const input = req.body as AppInstanceInput;
      await createAppInstance(input);

      res.send({ 'result': 'ok' });    
    } catch (e) {
      console.error(e);
      res.status(400).send({
        error: e,
      });
    }
  });

  expressApp.post('/apps/instances/start', async (req, res) => {
    try {
      const appInstanceId = req.body.id;
      await startAppInstance(appInstanceId);
    
      res.send({ status: 'ok' });
    } catch (e) {
      console.error(e);
      res.status(400).send({
        error: e,
      });
    }
  });

  expressApp.post('/apps/instances/stop', async (req, res) => {
    try {
      const appInstanceId = req.body.id;
      stopAppInstance(appInstanceId);
    
      res.send({ status: 'ok' });
    } catch (e) {
      console.error(e);
      res.status(400).send({
        error: e,
      });
    }
  });

  expressApp.post('/apps/instances/remove', async (req, res) => {
    try {
      const appInstanceId = req.body.id;
      await removeAppInstance(appInstanceId);
      res.send({ 'result': 'ok' });
    } catch (e) {
      console.error(e);
      res.status(400).send({
        error: e,
      });
    }
  });

  expressApp.post('/apps/containers/update', async (req, res) => {
    try {
      const containerId = req.body.id;
      const container = (await coreRqlite.query([['SELECT * FROM container WHERE id = ?', containerId]])).toArray()[0];
      const appInstance = (await coreRqlite.query([['SELECT * FROM app_instance WHERE id = ?', container.app_instance_id]])).toArray()[0];
      const image = (await coreRqlite.query([['SELECT * FROM image WHERE id = ?', container.image_id]])).toArray()[0];
      console.log(container, image);
      const dockerRuntimeId = container.docker_runtime_id;
      try {
        await docker.getContainer(dockerRuntimeId).stop();
      } catch (e) {
        console.error(e);
      }
      try {
        await docker.getContainer(dockerRuntimeId).remove();
      } catch (e) {
        console.error(e);
      }
      const dockerContainer = await createContainer({
        appId: appInstance.app_id,
        appInstanceId: appInstance.id,
        containerId: container.id,
        imageId: container.image_id,
        imageName: image.name,
        imageRepository: image.repository,
        innerPort: image.inner_port,
        outerPort: container.outer_port,
        userId: appInstance.user_id,
      });
      await dockerContainer.start();

      await coreRqlite.execute([['UPDATE container SET docker_runtime_id = ? WHERE id = ?', dockerContainer.id, container.id]]);
      res.send({ 'result': 'ok' });
    } catch (e) {
      console.error(e);
      res.status(400).send({
        error: e,
      });
    }
  });

  expressApp.post('/apps/uninstall', async (req, res) => {
    try {
      const appId = req.body.id;
      await uninstallApp(appId);

      res.send({ 'result': 'ok' });
    } catch (e) {
      console.error(e);
      res.status(400).send({
        error: e,
      });
    }
  });
};

export default apps;