import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'cross-fetch';
import coreRqlite from '../../coreRqlite';
import { ContainerDeviceInput, DeviceInput, TypedRequestBody } from '../../types';
import DeviceModel from '../models/device.model';
import AppInstanceModel from '../models/appInstance.model';
import BaseDevice, { Manifest } from '../devices/baseDevice';
import AppAction from '../actions/app.action';
import AppInstanceAction from '../actions/appInstance.action';
import BaseController from './base.controller';
import { sleep } from '../..';

class DeviceController extends BaseController {
  initializeRoutes(): void {
    const expressApp = this.expressApp;

    expressApp.post('/devices/list', async (req:TypedRequestBody<void>, res) => {
      try {
        const results = await DeviceModel.getDevices();
        res.send(results);
      } catch (e) {
        console.error(e);
        res.status(400).send({
          error: e,
        });
      }
    });
        
    expressApp.post('/devices/add', async (req:TypedRequestBody<DeviceInput>, res) => {
      try {
        const input = req.body;
        const deviceId = uuidv4();
        const driverId = uuidv4();
        const appId = await AppAction.installApp(req.user.id, {
          name: input.name,
          images: [{
            name: input.name,
            repository: input.image,
            inner_port: input.inner_port,
          }],
        });
        const appInstanceId = await AppInstanceAction.createAppInstance({
          app_id: appId,
          name: input.name,
          containers: [],
        }, true);
        await AppInstanceAction.startAppInstance(appInstanceId);
        await DeviceModel.createDriver({
          id: driverId,
          name: input.name,
          app_id: appId,
        });
        await DeviceModel.createDevice({
          id: deviceId,
          name: input.name,
          device_type_id: '',
          node_id: '',
          driver_id: driverId,
        });
        const container = (await AppInstanceModel.getAppInstanceContainers(appInstanceId))[0];
        const device = new BaseDevice(container.outer_port);
        let manifest: Manifest;
        for (let i = 0; i < 10; i++) {
          try {
            manifest = await device.getManifest();
            break;
          } catch (e) {
            await sleep(1000);
          }
        }
        if (manifest.type) {
          await DeviceModel.updateDeviceType(deviceId, manifest.type);
        }
        res.send({ 'result': 'ok' });
      } catch (e) {
        console.error(e);
        res.status(400).send({
          error: e,
        });
      }
    });
        
    expressApp.post('/devices/remove', async (req:TypedRequestBody<{ id: string }>, res) => {
      try {
        const deviceId = req.body.id;
        const device = await DeviceModel.getDevice(deviceId);
        const driver = await DeviceModel.getDriver(device.driver_id);
        const appInstance = await AppInstanceModel.getFirstAppInstanceOfApp(driver.app_id);
        await AppInstanceAction.removeAppInstance(appInstance.id, true);
        await AppAction.uninstallApp(driver.app_id);
        await DeviceModel.removeDevice(deviceId);
        await DeviceModel.removeDriver(device.driver_id);
        
        res.send({ 'result': 'ok' });
      } catch (e) {
        console.error(e);
        res.status(400).send({
          error: e,
        });
      }
    });
        
    expressApp.post('/devices/app_options_env/get_fields', async (req:TypedRequestBody<{ id: string }>, res) => {
      try {
        const deviceId = req.body.id;
        
        const container = await DeviceModel.getDeviceContainer(deviceId);
        
        const device = new BaseDevice(container.outer_port);
        const fields = await device.getEnvFields();
        res.send(fields);
      } catch (e) {
        console.error(e);
        res.status(400).send({
          error: e,
        });
      }
    });
        
    expressApp.post('/devices/app_options/get_fields', async (req:TypedRequestBody<{ id:string }>, res) => {
      try {
        const deviceId = req.body.id;
        
        const container = await DeviceModel.getDeviceContainer(deviceId);
        
        const device = new BaseDevice(container.outer_port);
        const fields = await device.getFields();
        res.send(fields);
      } catch (e) {
        console.error(e);
        res.status(400).send({
          error: e,
        });
      }
    });
        
    expressApp.post('/devices/get_options', async (req:TypedRequestBody<{ device_id: string, container_id: string }>, res) => {
      try {
        const options = await DeviceModel.getDeviceOptionsOfContainer(req.body.device_id, req.body.container_id);
        
        const optionsObject = {};
        options.forEach((option) => {
          optionsObject[option.device_option_name] = option.container_option_value;
        });
        res.send(optionsObject);
      } catch (e) {
        console.error(e);
        res.status(400).send({
          error: e,
        });
      }
    });

    expressApp.post('/devices/add_device_to_container', async (req:TypedRequestBody<{
      container_id: string,
      device_id: string,
      device_input: ContainerDeviceInput
    }>, res) => {
      const container = await AppInstanceModel.getContainer(req.body.container_id);
      const appInstance = await AppInstanceModel.getAppInstance(container.app_instance_id);
      await AppInstanceAction.addDeviceToContainer(
        req.body.container_id,
        req.body.device_id,
        appInstance.user_id,
        req.body.device_input,
      );
    });

    expressApp.post('/devices/remove_device_from_container', async (req:TypedRequestBody<
    { container_id: string, device_id: string }
    >, res) => {
      await DeviceModel.removeDeviceFromContainer({
        containerId: req.body.container_id,
        deviceId: req.body.device_id,
      });
    });
  }
}

export default DeviceController;