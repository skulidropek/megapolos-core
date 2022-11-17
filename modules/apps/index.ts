import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import coreRqlite from '../../coreRqlite';
import docker from '../../coreDocker';
import { AppInput, AppInstanceInput } from '../../types';

const getPort = async () => {
  let usedPorts = (await coreRqlite.query('SELECT outer_port FROM container')).toArray().map((app) => app.outer_port);
  for (let i = 10000; i < 20000; i++) {
    if (!usedPorts.includes(i)) {
      return i;
    }
  }
  throw new Error('No available port');
};

const apps = (expressApp:Express) => {
  expressApp.post('/apps/list', async (req, res) => {
    const results = (await coreRqlite.query('SELECT * FROM app')).toArray();
    for (let i in results) {
      const images = (await coreRqlite.query([['SELECT * FROM image WHERE app_id = ?', results[i].id]])).toArray();
      results[i].images = images;
    }
    res.send(results);
  });

  expressApp.post('/apps/instances/list', async (req, res) => {
    const results = (await coreRqlite.query('SELECT * FROM app_instance')).toArray();
    for (let i in results) {
      const containers = (await coreRqlite.query([['SELECT * FROM container WHERE app_instance_id = ?', results[i].id]])).toArray();
      results[i].containers = containers;
    }
    res.send(results);
  });

  expressApp.post('/apps/install', async (req, res) => {
    const appId = uuidv4();
    const input = req.body as AppInput;
    
    await coreRqlite.execute([[`
        INSERT INTO app (id, owner_user_id, name) 
        VALUES (?, ?, ?)
    `, appId, req.user.id, input.name]]);
    for (let i in input.images) {
      const image = input.images[i];
      const imageId = uuidv4();
      await coreRqlite.execute([[`
        INSERT INTO image (id, name, app_id, repository, commit_id, inner_port)
        VALUES (?, ?, ?, ?, ?, ?)
      `, imageId, image.name, appId, image.repository, '', image.inner_port]]);
    }
    res.send({ 'result': 'ok' });
  });

  expressApp.post('/apps/instances/create', async (req, res) => {
    const appInstanceId = uuidv4();
    const userId = uuidv4();
    const input = req.body as AppInstanceInput;

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
      const dockerRuntimeId = (await docker.createContainer({
        name: containerId + '_' + image.name,
        Image: image.repository,
        HostConfig: {
          PortBindings: {
            [image.inner_port + '/tcp']: [{ HostPort: outerPort.toString() }],
          },
          ExtraHosts: [
            'host.docker.internal:host-gateway',
          ],
        },
      })).id;
      await coreRqlite.execute([[`
        INSERT INTO container (id, docker_runtime_id, name, image_id, node_id, outer_port, app_instance_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, containerId, dockerRuntimeId, input.name, containerId, '', outerPort, appInstanceId]]);
    }

    res.send({ 'result': 'ok' });    
  });

  expressApp.post('/apps/instances/start', async (req, res) => {
    const appInstanceId = req.body.id;
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
    res.send({ status: 'ok' });
  });

  expressApp.post('/apps/instances/stop', async (req, res) => {
    const appInstanceId = req.body.id;
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
    res.send({ status: 'ok' });
  });

  expressApp.post('/apps/instances/remove', async (req, res) => {
    const appInstanceId = req.body.id;
    const instance = (await coreRqlite.query([['SELECT * FROM app_instance WHERE id = ?', appInstanceId]])).toArray()[0];
    const containers = (await coreRqlite.query([['SELECT * FROM container WHERE app_instance_id = ?', appInstanceId]])).toArray();
    for (let i in containers) {
      const container = containers[i];
      try {
        await docker.getContainer(container.docker_runtime_id).stop();
      } catch (e) {
        console.error(e);
      }
      await docker.getContainer(container.docker_runtime_id).remove();
      
      await coreRqlite.execute([['DELETE FROM container WHERE id = ?', container.id]]);
    }
    await coreRqlite.execute([[
      'DELETE FROM app_instance WHERE id = ?', appInstanceId]]);
    await coreRqlite.execute([[
      'DELETE FROM user WHERE id = ?', instance.user_id]]);
    res.send({ 'result': 'ok' });
  });

  expressApp.post('/apps/uninstall', async (req, res) => {
    const appId = req.body.id;
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

    res.send({ 'result': 'ok' });
  });
};

export default apps;