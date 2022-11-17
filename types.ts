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
}

export interface UserInput {
  name: string,
}

declare global {
  namespace Express {
    export interface Request {
      user?: any;
    }
  }
}

export default {};