/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import graphqlServer from './src/features/graphql/server';
import MegapolosNode from './src/features/repository/Node';
import User from './src/features/repository/user/User';

if (process.getuid() != 0) {
  console.trace('You must run this app as root');
  // process.exit(1);
}

export const megapolosPath = __dirname;

// exec('mount --make-shared /');

(async () => {
  MegapolosNode.createCurrentNode();

  // await MegapolosNode.currentNode.dockerEvents();
  // await MegapolosNode.currentNode.restoreContainers();

  await new User(undefined).checkGroupUserLinks();
  await new User(undefined).createRootUser();
  const users = await new User(undefined).getUsersWithToken();
  console.log(users.map((u) => ({ name: u.name, token: u.token })));

  graphqlServer();
})();

export function sleep(ms:number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}