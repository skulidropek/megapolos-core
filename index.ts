import UserAction from './modules/actions/user.action';
import AppInstanceAction from './modules/actions/appInstance.action';

import graphqlServer from './grapgql';

if (process.getuid() != 0) {
  console.error('You must run this app as root');
  // process.exit(1);
}

export const megapolosPath = __dirname;

(async () => {
  await AppInstanceAction.dockerEvents();
  await AppInstanceAction.restoreContainers();

  await UserAction.createRoot();

  graphqlServer();
})();

export function sleep(ms:number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}