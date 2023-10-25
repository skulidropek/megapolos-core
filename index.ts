/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { exec } from 'child_process';
import UserAction from './modules/actions/user.action';
import AppInstanceAction from './modules/actions/appInstance.action';

import graphqlServer from './grapgql';
import MegapolosNode from './classes/Node';

if (process.getuid() != 0) {
  console.error('You must run this app as root');
  // process.exit(1);
}

export const megapolosPath = __dirname;

exec('mount --make-shared /');

(async () => {
  MegapolosNode.createCurrentNode();

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