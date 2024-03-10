/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { exec } from 'child_process';

import graphqlServer from './grapgql';
import MegapolosNode from './classes/Node';
import User from './classes/User';

if (process.getuid() != 0) {
  console.trace('You must run this app as root');
  // process.exit(1);
}

export const megapolosPath = __dirname;

exec('mount --make-shared /');

(async () => {
  MegapolosNode.createCurrentNode();

  // await MegapolosNode.currentNode.dockerEvents();
  // await MegapolosNode.currentNode.restoreContainers();

  const user = await User.createRootUser();
  console.log((await user.getDataWithToken()).token);

  graphqlServer();
})();

export function sleep(ms:number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}