interface UserAction {
  resourceType: string;
  resourceId: string;
  action: string;
}

const defaultRights = {
  create: 'create',
  remove: 'remove',
  edit: 'edit',
  read: 'read',
};

const resources = {
  repository: {
    type: 'repository',
    actions: { ...defaultRights, fetch: 'fetch', push: 'push' },
  },
  container: {
    type: 'container',
    actions: { ...defaultRights, manage: 'manage' },
  },
  image: {
    type: 'image',
    actions: { ...defaultRights, build: 'build', update_nodes: 'update_nodes' },
  },
  app_instance: {
    type: 'app_instance',
    actions: { ...defaultRights, build: 'build', manage: 'manage' },
  },
  app: {
    type: 'app',
    actions: { ...defaultRights },
  },
};

export { defaultRights, resources, UserAction };
