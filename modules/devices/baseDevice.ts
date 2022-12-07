import fetch from 'cross-fetch';

export interface Manifest {
  name: string;
  type: string;
  container_fields: [string];
  container_env_fields: [string];
}

class BaseDevice {
  port: number;

  constructor(port: number) {
    this.port = port;
  }

  async request(url: string, options: any) {
    const results = await fetch(`http://localhost:${this.port}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    return results.json();
  }

  async getManifest():Promise<Manifest> {
    return this.request('/get_manifest', {});
  }

  async getFields():Promise<[string]> {
    return (await this.getManifest()).container_fields;
  }

  async getEnvFields():Promise<[string]> {
    return (await this.getManifest()).container_env_fields;
  }

  async getEnvFieldsValues(userId: string):Promise<{ [key: string]: string }> {
    return this.request('/app_options_env/get', { user_id: userId });
  }

}

export default BaseDevice;