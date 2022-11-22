import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'cross-fetch';
import coreRqlite from '../../coreRqlite';
import { DeviceInput } from '../../types';
import { createAppInstance, installApp, removeAppInstance, startAppInstance, uninstallApp } from '../apps';
const devices = (expressApp:Express) => {
  expressApp.post('/devices/list', async (req, res) => {
    try {
      const results = (await coreRqlite.query('SELECT * FROM device')).toArray();
      res.send(results);
    } catch (e) {
      console.error(e);
      res.status(400).send({
        error: e,
      });
    }
  });

  expressApp.post('/devices/add', async (req, res) => {
    try {
      const input: DeviceInput = req.body;
      const deviceId = uuidv4();
      const driverId = uuidv4();
      const appId = await installApp(req.user.id, {
        name: input.name,
        images: [{
          name: input.name,
          repository: input.image,
          inner_port: input.inner_port,
        }],
      });
      const appInstanceId = await createAppInstance({
        app_id: appId,
        name: input.name,
        containers: {},
      });
      await startAppInstance(appInstanceId);
      coreRqlite.execute([[`
      INSERT INTO driver (id, name, app_id) VALUES (?, ?, ?)
    `, driverId, input.name, appId]]);
      await coreRqlite.execute([[`
      INSERT INTO device (id, name, device_type_id, node_id, driver_id) VALUES (?, ?, ?, ?, ?)
    `, deviceId, input.name, input.type, '', driverId]]);
      res.send({ 'result': 'ok' });
    } catch (e) {
      console.error(e);
      res.status(400).send({
        error: e,
      });
    }
  });

  expressApp.post('/devices/remove', async (req, res) => {
    try {
      const deviceId = req.body.id;
      const device = (await coreRqlite.query([[`
      SELECT * FROM device WHERE id = ?
    `, deviceId]])).toArray()[0];
      const driver = (await coreRqlite.query([[`
      SELECT * FROM driver WHERE id = ?
    `, device.driver_id]])).toArray()[0];
      const appInstance = (await coreRqlite.query([[`
      SELECT * FROM app_instance WHERE app_id = ?
    `, driver.app_id]])).toArray()[0];
      await removeAppInstance(appInstance.id);
      await uninstallApp(driver.app_id);
      await coreRqlite.execute([[`
      DELETE FROM device WHERE id = ?
    `, deviceId]]);
      await coreRqlite.execute([[`
      DELETE FROM driver WHERE id = ?
    `, device.driver_id]]);

      res.send({ 'result': 'ok' });
    } catch (e) {
      console.error(e);
      res.status(400).send({
        error: e,
      });
    }
  });

  expressApp.post('/devices/app_options_env/get_fields', async (req, res) => {
    try {
      const deviceId = req.body.id;

      const container = (await coreRqlite.query([[`
      SELECT c.* FROM device d
      LEFT JOIN driver dr ON d.driver_id = dr.id
      LEFT JOIN app_instance ai ON dr.app_id = ai.app_id
      LEFT JOIN container c ON ai.id = c.app_instance_id
      WHERE d.id = ?
      LIMIT 1
    `, deviceId]])).toArray()[0];

      const fields = await fetch(`http://localhost:${container.outer_port}/app_options_env/get_fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      res.send(await fields.json());
    } catch (e) {
      console.error(e);
      res.status(400).send({
        error: e,
      });
    }
  });
};

export default devices;