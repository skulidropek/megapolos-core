import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import coreRqlite from '../../coreRqlite';
import docker from '../../coreDocker';
import { AppInput, AppInstanceInput } from '../../types';
import { createToken, megapolosPath } from '../../index';

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
  return (docker.createContainer({
    name: data.containerId + '_' + data.imageName,
    Image: data.imageRepository,
    Env: [
      'MEGAPOLOS=1',
      'MEGAPOLOS_TOKEN=' + createToken(data.userId),
      'MEGAPOLOS_APP_ID=' + data.appId,
      'MEGAPOLOS_APP_INSTANCE_ID=' + data.appInstanceId,
      'MEGAPOLOS_CONTAINER_ID=' + data.containerId,
      'MEGAPOLOS_IMAGE_ID=' + data.imageId,
      'MEGAPOLOS_PATH_DATA=' + megapolosPath + '/data',
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

export const createAppInstance = async (input: AppInstanceInput) => {
  const appInstanceId = uuidv4();
  const userId = uuidv4();

  const app = (await coreRqlite.query([[`
      SELECT * FROM app WHERE id = ?
    `, input.app_id]])).toArray()[0];
  const images = (await coreRqlite.query([[`
      SELECT * FROM image WHERE app_id = ?
    `, input.app_id]])).toArray();

  await coreRqlite.execute([[`
      INSERT INTO user (id, name, group_user_id) VALUES (?, ?, ?)
    `, userId, 'app_' + input.name, 'app']]);

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

export const removeAppInstance = async (appInstanceId) => {
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
  }
  await coreRqlite.execute([[
    'DELETE FROM app_instance WHERE id = ?', appInstanceId]]);
  await coreRqlite.execute([[
    'DELETE FROM user WHERE id = ?', instance.user_id]]);
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