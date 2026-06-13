// install.ts — оркестрация установки кластера на TypeScript (без внешних GraphQL).
// Запускается ПОСЛЕ того как доступны node.js + postgres (см. deploy.sh).
// Делает то, что раньше делал deploy.sh через curl:
//   нода -> INIT (nginx, единый CA) -> PREPARE FOR CORE -> INSTALL REGISTRY
//   -> (опц.) репозиторий -> app -> image -> build -> version -> instance -> deploy.
//
// Управление через переменные окружения:
//   MEGAPOLOS_NODE_HOST / MEGAPOLOS_NODE_USER / MEGAPOLOS_NODE_PASSWORD
//   MEGAPOLOS_REGISTRY_HOST
//   MEGAPOLOS_BOOTSTRAP_APP_REPO    (git URL приложения; пусто = пропустить деплой)
//   MEGAPOLOS_BOOTSTRAP_APP_NAME / _PORT / _DOMAIN / _OUTER_PORT

import config from './src/domain/config/config';
import { initMikroOrm } from './src/features/db/mikro-orm';
import NodeRepo from './src/features/repository/megapolos.node.repository';
import UserRepo from './src/features/repository/user/user.repository';
import DockerRegistryRepo from './src/features/repository/docker.registry.repository';
import RepositoryRepo from './src/features/repository/repository.repository';
import AppRepo from './src/features/repository/app.repository';
import ImageRepo from './src/features/repository/image.repository';
import { ImageStatus } from './src/domain/entities/Image.entity';
import AppVersionRepo from './src/features/repository/app.version.repository';
import { ConfigurationRepo } from './src/features/repository/configuration.repository';
import AppInstanceRepo from './src/features/repository/app.instance.repository';
import { ensureMegapolosCA } from './src/features/ca/megapolos-ca';
import { Context } from './src/api/graphql/server';

const env = process.env;
const NODE_HOST =
  env.MEGAPOLOS_NODE_HOST || (config.devMode ? 'megapolos.local' : 'localhost');
const NODE_USER = env.MEGAPOLOS_NODE_USER || 'root';
const NODE_PASSWORD = env.MEGAPOLOS_NODE_PASSWORD || 'root';
const REGISTRY_HOST = env.MEGAPOLOS_REGISTRY_HOST || config.registryHost || NODE_HOST;
const REGISTRY_USER = config.registryUser || 'megapolos';
const REGISTRY_PASSWORD = config.registryPassword || 'megapolos';

const APP_REPO = env.MEGAPOLOS_BOOTSTRAP_APP_REPO || '';
const APP_NAME = env.MEGAPOLOS_BOOTSTRAP_APP_NAME || 'megapolos-gui';
const APP_PORT = Number(env.MEGAPOLOS_BOOTSTRAP_APP_PORT || 80);
const APP_DOMAIN = env.MEGAPOLOS_BOOTSTRAP_APP_DOMAIN || '';
const APP_OUTER_PORT = Number(env.MEGAPOLOS_BOOTSTRAP_APP_OUTER_PORT || 3000);

// admin-контекст (root, без проверки прав) — операции репозиториев требуют ctx.user
let ctx: Context;

function log(msg: string) {
  console.log(`[install] ${msg}`);
}

async function waitNodeRunning(nodeId: string, label: string) {
  for (let i = 0; i < 90; i++) {
    const n = await new NodeRepo(ctx, nodeId).getEntity(true);
    if (n.lifeStatus === 'running') return;
    await new Promise((r) => setTimeout(r, 3000));
  }
  log(`WARN: ${label} — нода не вернулась в running за отведённое время`);
}

async function setupNode(): Promise<string> {
  let nodes = await new NodeRepo(ctx).getByFields({ name: 'localhost' });
  let node = nodes[0];
  if (!node) {
    node = await new NodeRepo(ctx).create({
      name: 'localhost',
      host: NODE_HOST,
      user: NODE_USER,
      password: NODE_PASSWORD,
    });
    log(`нода создана: ${node.id} (${NODE_HOST})`);
  } else {
    log(`нода уже существует: ${node.id}`);
  }

  const existingReg = await new DockerRegistryRepo(ctx).getDefault();
  if (!existingReg) {
    await new DockerRegistryRepo(ctx).create({
      name: 'default',
      host: REGISTRY_HOST,
      user: REGISTRY_USER,
      password: REGISTRY_PASSWORD,
      isDefault: true,
    });
    log(`docker registry создан: ${REGISTRY_HOST}`);
  }

  log('INIT ноды (nginx, единый CA)...');
  await new NodeRepo(ctx, node.id).init();
  await waitNodeRunning(node.id, 'INIT');

  log('PREPARE FOR CORE...');
  await new NodeRepo(ctx, node.id).prepareForCore();
  await waitNodeRunning(node.id, 'PREPARE FOR CORE');

  log('INSTALL REGISTRY...');
  await new NodeRepo(ctx, node.id).installRegistry();
  await waitNodeRunning(node.id, 'INSTALL REGISTRY');

  log('нода готова');
  return node.id;
}

async function deployApp(nodeId: string, rootUserId: string) {
  if (!APP_REPO) {
    log('MEGAPOLOS_BOOTSTRAP_APP_REPO не задан — пропускаю деплой приложения');
    return;
  }
  log(`деплой приложения ${APP_NAME} из ${APP_REPO}...`);

  const repo = await new RepositoryRepo(ctx).create({
    name: APP_NAME,
    url: APP_REPO,
    repositoryType: 'remote',
  });

  const app = await new AppRepo(ctx).installApp(rootUserId, {
    name: APP_NAME,
    description: APP_NAME,
    images: [{ name: APP_NAME, image: APP_NAME, inner_port: APP_PORT }],
  } as any);

  const images = await new ImageRepo(ctx).getByFields({ app: app.id });
  const image = images[0];
  await new ImageRepo(ctx, image.id).update({ repository: repo.id as any });

  log('сборка образа (build + push в registry)...');
  await new ImageRepo(ctx, image.id).build();
  for (let i = 0; i < 120; i++) {
    const img = await new ImageRepo(ctx, image.id).getEntity(true);
    if (img.status === ImageStatus.Built) break;
    await new Promise((r) => setTimeout(r, 5000));
  }

  const conf = await new ConfigurationRepo(ctx).createOrEditFromData({
    appId: app.id,
    configurationData: { name: 'default', services: [] } as any,
  });
  const version = await new AppVersionRepo(ctx).createAppVersion(
    { app: app.id, configuration: conf.id, buildNumber: 1, version: '1.0.0' } as any,
    [{ imageId: image.id } as any]
  );

  const container: any = {
    name: APP_NAME,
    role: 'app',
    node: nodeId,
    image: image.id,
    outerPort: APP_OUTER_PORT,
    volumes: [],
    dbs: [],
    envs: [],
  };
  if (APP_DOMAIN) {
    container.domain = { domainData: { name: APP_DOMAIN } };
  }
  await new AppInstanceRepo(ctx).createConfiguratedInstance(version.id, null, {
    name: APP_NAME,
    containers: [container],
  } as any);

  await new NodeRepo(ctx, nodeId).updateNode(false, false, []);
  log(`приложение ${APP_NAME} задеплоено${APP_DOMAIN ? ' на https://' + APP_DOMAIN : ''}`);
}

(async () => {
  await initMikroOrm();
  NodeRepo.createCurrentNode();
  await new UserRepo(undefined).checkGroupUserLinks();
  await new UserRepo(undefined).createRootUser();
  ensureMegapolosCA();

  const rootUser = (await new UserRepo(undefined).getByGroupName('root'))[0];
  if (!rootUser) throw new Error('root user not found');
  ctx = new Context({ req: {} as any, res: {} as any, user: rootUser, noRightsCheck: true });

  const nodeId = await setupNode();
  await deployApp(nodeId, rootUser.id);

  log('установка завершена');
  process.exit(0);
})().catch((e) => {
  console.error('[install] ошибка:', e);
  process.exit(1);
});
