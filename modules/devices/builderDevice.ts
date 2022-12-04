import BaseDevice from './baseDevice';

class BuilderDevice extends BaseDevice {
  async build(image:string, path:string) {
    return this.request('/build', {
      image, path,
    });
  }
  async buildLocal(containerId: string, image: string) {
    return this.request('/build_local', {
      container_id: containerId,
      image
    });
  }
}

export default BuilderDevice;