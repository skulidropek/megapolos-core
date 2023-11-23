import CertificateDevice from '../devices/certificateDevice';
import ResourceModel from '../models/resource.model';
import { ResourceCertificateTable } from '../models/tables';
import BaseResource from './BaseResource';

class CertificateResource extends BaseResource {
  static async getCertificates():Promise<CertificateResource[]> {
    const data = await ResourceModel.getCertificates();
    return data.map((item) => new CertificateResource(item.id));
  }

  async getDevice():Promise<CertificateDevice> {
    const data = await this.getData();
    return new CertificateDevice(data.device_id);
  }

  async getCertificateData():Promise<ResourceCertificateTable> {
    return ResourceModel.getCertificateResource(this.id);
  }

  async createCertificate():Promise<void> {
    const device = await this.getDevice();
  }

  async remove():Promise<void> {
  }

}

export default CertificateResource;
