/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import graphqlServer from './src/api/graphql/server';
import config from './src/domain/config/config';
import { initMikroOrm } from './src/features/db/mikro-orm';
import NodeRepo from './src/features/repository/megapolos.node.repository';
import UserRepo from './src/features/repository/user/user.repository';

if (!config.noRoot) {
  if (process.getuid() != 0) {
    console.trace('You must run this app as root');
    process.exit(1);
  }
}

export const megapolosPath = __dirname;

(async () => {
  await initMikroOrm();
  NodeRepo.createCurrentNode();

  await new UserRepo(undefined).checkGroupUserLinks();
  await new UserRepo(undefined).createRootUser();
  const users = await new UserRepo(undefined).getUsersWithToken();
  console.log(users.map((u) => ({ name: u.name, token: u.token })));

  graphqlServer();
})();

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
