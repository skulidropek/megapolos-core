import DatabaseDevice from '../devices/databaseDevice';
import ResourceModel from '../models/resource.model';
import { ResourceDbTable } from '../models/tables';
import BaseResource from './BaseResource';

class DbResource extends BaseResource {
  async getDbData():Promise<ResourceDbTable> {
    return ResourceModel.getDbResource(this.id);
  }

  async getDevice():Promise<DatabaseDevice> {
    const data = await this.getData();
    return new DatabaseDevice(data.device_id);
  }

  async remove():Promise<void> {
  }
    
}

export default DbResource;
