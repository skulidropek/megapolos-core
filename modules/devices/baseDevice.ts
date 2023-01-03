import { gql, GraphQLClient } from 'graphql-request';

export interface Manifest {
  name: string;
  type: string;
  fields: [string];
  container_fields: [string];
  container_env_fields: [string];
}

class BaseDevice {
  client: GraphQLClient;
  port: number;

  constructor(port: number) {
    this.port = port;

    this.client = new GraphQLClient(`http://localhost:${port}/graphql`);
  }

  async getManifest():Promise<Manifest> {
    return (await this.client.request(gql`
      query {
        getManifest {
          name
          type
          fields
          container_fields
          container_env_fields
        }
      }
      `)).getManifest;
  }

  async getFields():Promise<[string]> {
    return (await this.getManifest()).container_fields;
  }

  async getEnvFields():Promise<[string]> {
    return (await this.getManifest()).container_env_fields;
  }

  async getEnvFieldsValues(userId: string):Promise<{ key: string, value: string }[]> {
    return (await this.client.request(gql`
      query($userId: String) {
        getAppOptionsEnv(userId: $userId) {
          key
          value
        }
      }
    `, { userId })).getAppOptionsEnv;
  }

}

export default BaseDevice;