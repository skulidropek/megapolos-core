import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import coreRqlite from '../../coreRqlite';
import docker from '../../coreDocker';
import { AppInput } from '../../types';

const getPort = async () => {
  let usedPorts = (await coreRqlite.query('SELECT port FROM app')).toArray().map((app) => app.port);
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
    res.send(results);
  });

  expressApp.post('/apps/install', async (req, res) => {
    const appId = uuidv4();
    const userId = uuidv4();
    const outerPort = await getPort();
    const input = req.body as AppInput;
    try {
      docker.getImage(input.image);
    } catch {
      await docker.pull(input.image);
    }
    const containerId = (await docker.createContainer({
      name: appId + '_' + input.name,
      Image: input.image,
      HostConfig: {
        PortBindings: {
          [input.inport + '/tcp']: [{ HostPort: outerPort.toString() }],
        },
        ExtraHosts: [
          'host.docker.internal:host-gateway',
        ],
      },
    })).id;
    await coreRqlite.execute([[`
        INSERT INTO user (id, name, role) VALUES (?, ?, ?)
    `, userId, 'app_' + input.name, 'app']]);
    await coreRqlite.execute([[`
        INSERT INTO app (id, owner_user_id, name, container_id, image, inner_port, outer_port, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, appId, userId, input.name, containerId, 
    input.image, input.inport, outerPort, 'stopped']]);
    res.send({ 'result': 'ok' });
  });

  expressApp.post('/apps/start', async (req, res) => {
    const appId = req.body.id;
    const app = (await coreRqlite.query([['SELECT * FROM app WHERE id = ?', appId]])).toArray()[0];
    try {
      await docker.getContainer(app.container_id).start();
    } catch (e) {
    }
    await coreRqlite.execute([[
      'UPDATE app SET status = ? WHERE id = ?', 'running', appId]]);
    res.send({ status: 'ok' });
  });

  expressApp.post('/apps/stop', async (req, res) => {
    const appId = req.body.id;
    const app = (await coreRqlite.query([['SELECT * FROM app WHERE id = ?', appId]])).toArray()[0];
    try {
      await docker.getContainer(app.container_id).stop();
    } catch (e) {
    }
    await coreRqlite.execute([[
      'UPDATE app SET status = ? WHERE id = ?', 'stopped', appId]]);
    res.send({ status: 'ok' });
  });

  expressApp.post('/apps/uninstall', async (req, res) => {
    const appId = req.body.id;
    const app = (await coreRqlite.query([['SELECT * FROM app WHERE id = ?', appId]])).toArray()[0];
    const containerId = app.container_id;
    try {
      await docker.getContainer(containerId).stop();
    } catch (e) {
    }
    await docker.getContainer(containerId).remove();

    await coreRqlite.execute([[
      'DELETE FROM app WHERE id = ?', appId]]);
    
    await coreRqlite.execute([[
      'DELETE FROM user WHERE id = ?', app.owner_user_id]]);
    res.send({ 'result': 'ok' });
  });
};

export default apps;