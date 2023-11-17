import CertificateDevice from '../devices/certificateDevice';
import BaseResource from './BaseResource';

class CertificateResource extends BaseResource {
  async getDevice():Promise<CertificateDevice> {
    const data = await this.getData();
    return new CertificateDevice(data.device_id);
  }

  async createCertificate():Promise<void> {
    const device = await this.getDevice();
  }

  async remove():Promise<void> {
  }

}

export default CertificateResource;
