import { PubSub } from 'graphql-subscriptions';
import { UserTable } from './modules/models/tables';

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

export interface AppInstanceInput {
  app_id: string,
  name: string,
  containers: {
    image_id: string,
    fixed_outer_port: number,
    devices: ContainerDeviceInput[]
    envs: {
      key: string,
      value: string,
    }[],
    volumes: ContainerVolumeInput[],
  }[]
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

export default {};