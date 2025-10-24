import { registerEnumType } from 'type-graphql';

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
  view_log: 'view_log',
};

const resources = {
  Repository: {
    type: 'Repository',
    actions: { ...defaultRights, fetch: 'fetch', push: 'push' },
  },
  Container: {
    type: 'Container',
    actions: { ...defaultRights, manage: 'manage' },
  },
  Image: {
    type: 'Image',
    actions: {
      ...defaultRights,
      build: 'build',
      update_nodes: 'update_nodes',
    },
  },
  AppInstance: {
    type: 'AppInstance',
    actions: {
      ...defaultRights,
      build: 'build',
      manage: 'manage',
      change_version: 'change_version',
    },
  },
  App: {
    type: 'App',
    actions: {
      ...defaultRights,
      add_app_version: 'add_app_version',
      delete_docker_images: 'delete_docker_images',
      build_images: 'build_images',
      update_nodes: 'update_nodes',
    },
  },
  Node: {
    type: 'Node',
    actions: { ...defaultRights },
  },
};

enum ResourceType {
  App = 'App',
  AppInstance = 'AppInstance',
  Container = 'Container',
  Image = 'Image',
  Node = 'Node',
  Repository = 'Repository',
}

registerEnumType(ResourceType, {
  name: 'ResourceType',
});

export { defaultRights, resources, UserAction, ResourceType };
