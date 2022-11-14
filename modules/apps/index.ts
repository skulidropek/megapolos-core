import { Express } from 'express';
import coreRqlite from '../../coreRqlite';
import docker from '../../coreDocker';

const apps = (expressApp:Express) => {
  expressApp.get('/apps/list', async (req, res) => {
    const results = (await coreRqlite.query('SELECT * FROM app')).toArray();
    res.send(results);
  });

  expressApp.get('/apps/start', async (req, res) => {
    const appId = req.query.id;
    const app = (await coreRqlite.query([['SELECT * FROM app WHERE id = ?', appId]])).toArray()[0];
    try {
      docker.getContainer(app.container_id).start();
    } catch (e) {
    }
    await coreRqlite.execute([[
      'UPDATE app SET status = ? WHERE id = ?', 'running', appId]]);
    res.send({ status: 'ok' });
  });

  expressApp.get('/apps/stop', async (req, res) => {
    const appId = req.query.id;
    const app = (await coreRqlite.query([['SELECT * FROM app WHERE id = ?', appId]])).toArray()[0];
    try {
      docker.getContainer(app.container_id).stop();
    } catch (e) {
    }
    await coreRqlite.execute([[
      'UPDATE app SET status = ? WHERE id = ?', 'stopped', appId]]);
    res.send({ status: 'ok' });
  });
};

export default apps;