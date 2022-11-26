import BaseDevice from './baseDevice';

class RepositoryDevice extends BaseDevice {
  async cloneContainer(containerId: string): Promise<{ path: string }> {
    return this.request('/clone_container', { container_id: containerId });
  }
}

export default RepositoryDevice;