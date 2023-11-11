/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { PubSub } from 'graphql-subscriptions';
import { AppInstanceTable, ContainerTable, ContainerVolumeTable, DeviceTable, UserTable } from './modules/models/tables';
import EventsObserver from './modules/events/eventsObserver';

export interface AppInput {
  name: string,
  images: [{
    name: string,
    image: string,
    inner_port: number,
  }]
}

export interface ContainerDeviceInput {
  id: string
  parameters: {
    key: string
    value: string
  }[],
  env_parameters: {
    key: string
    value: string
  }[],
}

export interface ContainerVolumeInput {
  name: string,
  inner_path: string,
  volume: string,
  is_dynamic: boolean,
}

export interface ContainerInput {
  image_id: string,
  fixed_outer_port: number,
  devices: ContainerDeviceInput[]
  envs: {
    key: string,
    value: string,
  }[],
  volumes: ContainerVolumeInput[],
}

export interface AppInstanceInput {
  app_id: string,
  name: string,
  containers: ContainerInput[]
}

export interface UserInput {
  name: string,
}

export interface DeviceInput {
  name: string,
  inner_port: number,
  image: string,
}

declare global {
  namespace Express {
    export interface Request {
      user?: UserTable;
    }
  }
}

export interface TypedRequestBody<T> extends Express.Request {
  body: T
}

export type Context = {
  user: UserTable,
  // pubsub: PubSub,
};

export type Resolver<TArguments, TResult> = (parent, args:TArguments, contextValue: Context, info) => TResult | Promise<TResult>;

export const resolver = <TArguments, TResult>(func:Resolver<TArguments, TResult>) => func;

export interface EnvironmentVariable {
  key: string;
  value: string;
}

export type ContainerResult = (ContainerTable & {
  volumes?: ContainerVolumeTable[]
  envs?: { key: string, value: string }[]
  devices?: {
    device: DeviceTable
    parameters: { key: string, value: string }[]
    env_parameters: { key: string, value: string }[]
  }[]
  docker_status?: string
});

export type AppInstanceResult = (AppInstanceTable & 
{
  containers?: ContainerResult[]
}
);

export default {};