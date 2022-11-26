import BaseDevice from './baseDevice';

class BuilderDevice extends BaseDevice {
  async build(image:string, path:string) {
    return this.request('/build', {
      image, path,
    });
  }
}

export default BuilderDevice;