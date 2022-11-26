import fetch from 'cross-fetch';

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

  async getFields():Promise<{ [key: string]: string }> {
    return this.request('/app_options/get_fields', {});
  }

  async getEnvFields():Promise<{ [key: string]: string }> {
    return this.request('/app_options_env/get_fields', {});
  }

  async getEnvFieldsValues(userId: string):Promise<{ [key: string]: string }> {
    return this.request('/app_options_env/get', { user_id: userId });
  }

}

export default BaseDevice;