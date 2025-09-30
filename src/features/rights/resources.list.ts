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
      delete_docker_image: 'delete_docker_image',
      build: 'build',
      update_nodes: 'update_nodes',
    },
  },
  AppInstance: {
    type: 'AppInstance',
    actions: { ...defaultRights, build: 'build', manage: 'manage' },
  },
  App: {
    type: 'App',
    actions: { ...defaultRights },
  },
  AppVersion: {
    type: 'AppVersion',
    actions: { ...defaultRights },
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
  AppVersion = 'AppVersion',
}

registerEnumType(ResourceType, {
  name: 'ResourceType',
});

export { defaultRights, resources, UserAction, ResourceType };
