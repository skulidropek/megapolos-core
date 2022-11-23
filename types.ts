export interface AppInput {
  name: string,
  images: [{
    name: string,
    repository: string,
    inner_port: number,
  }]
}

export interface AppInstanceInput {
  app_id: string,
  name: string,
  containers: {
    [key: string]: {
      devices: {
        [key: string]: {
          parameters: {
            [key: string]: string,
          },
          env_parameters: {
            [key: string]: string,
          }
        }
      }
  }
}

export interface UserInput {
  name: string,
}

export interface DeviceInput {
  name: string,
  type: string,
  inner_port: number,
  image: string,
}

declare global {
  namespace Express {
    export interface Request {
      user?: any;
    }
  }
}

export default {};