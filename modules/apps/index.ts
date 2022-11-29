import { Express } from 'express';
import docker from '../../coreDocker';
import { AppInput, AppInstanceInput } from '../../types';
import AppModel from '../models/app.model';
import AppInstanceModel from '../models/appInstance.model';
import { AppInstanceTable, AppTable, ContainerTable, ImageTable } from '../models/tables';
import AppAction from '../actions/app.action';
import AppInstanceAction from '../actions/appInstance.action';

const apps = (expressApp:Express) => {
  expressApp.post('/apps/list', async (req, res) => {
    try {
      const results:(AppTable & { images?: ImageTable[] })[] = await AppModel.getApps();
      for (let i in results) {
        const images = await AppModel.getImagesOfApp(results[i].id);
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
      const results:(AppInstanceTable & { containers?: ContainerTable[] })[] = await AppInstanceModel.getAppInstances();
      for (let i in results) {
        const containers = await AppInstanceModel.getAppInstanceContainers(results[i].id);
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
      await AppAction.installApp(req.user.id, input);
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
      await AppInstanceAction.createAppInstance(input);

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
      await AppInstanceAction.startAppInstance(appInstanceId);
    
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
      AppInstanceAction.stopAppInstance(appInstanceId);
    
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
      await AppInstanceAction.removeAppInstance(appInstanceId);
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
      const container = await AppInstanceModel.getContainer(containerId);
      const appInstance = await AppInstanceModel.getAppInstance(container.app_instance_id);
      const image = await AppModel.getImage(container.image_id);
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
      const dockerContainer = await AppInstanceAction.createContainer({
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

      await AppInstanceModel.updateContainerDockerRuntimeId(containerId, dockerContainer.id);
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
      await AppAction.uninstallApp(appId);

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