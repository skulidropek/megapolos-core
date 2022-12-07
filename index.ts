import express from 'express';
import cors from 'cors';

import authMiddleware from './modules/middlewares/auth.middleware';
import UserAction from './modules/actions/user.action';
import AppInstanceAction from './modules/actions/appInstance.action';
import AppController from './modules/controllers/app.controller';
import DeviceController from './modules/controllers/device.controller';
import UserController from './modules/controllers/user.controller';
import EventController from './modules/controllers/event.controller';
import NodeController from './modules/controllers/node.controller';

import graphqlServer from './grapgql';

if (process.getuid() != 0) {
  console.error('You must run this app as root');
  process.exit(1);
}

const app = express();
const port = 5100;

app.use(cors());
app.use(express.json());
app.use(authMiddleware);

new AppController(app);
new DeviceController(app);
new UserController(app);
new EventController(app);
new NodeController(app);

export const megapolosPath = __dirname;

(async () => {
  await AppInstanceAction.dockerEvents();
  await AppInstanceAction.restoreContainers();

  await UserAction.createRoot();

  app.listen(port, '0.0.0.0', async () => {
    console.log(`Example app listening on port ${port}`);
  });
  graphqlServer();
})();

export function sleep(ms:number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}