/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { v4 as uuidv4 } from 'uuid';
import { sleep } from '../..';
import BaseDevice, { Manifest } from '../devices/baseDevice';
import EventsObserver from '../events/eventsObserver';
import AppModel from '../models/app.model';
import AppInstanceModel from '../models/appInstance.model';
import DeviceModel from '../models/device.model';

class DeviceAction {

  static async createDevice(appId: string) {
    const deviceId = uuidv4();
    const driverId = uuidv4();

    const app = await AppModel.getApp(appId);
    const appInstance = await AppInstanceModel.getFirstAppInstanceOfApp(appId);

    await DeviceModel.createDriver({
      id: driverId,
      name: app.name,
      app_id: appId,
    });
    await DeviceModel.createDevice({
      id: deviceId,
      name: app.name,
      device_type_id: '',
      node_id: '',
      driver_id: driverId,
    });
    const container = (await AppInstanceModel.getAppInstanceContainers(appInstance.id))[0];
    const device = new BaseDevice(container.outer_port);
    let manifest: Manifest | undefined;
    for (let i = 0; i < 10; i++) {
      try {
        manifest = await device.getManifest();
        break;
      } catch (e) {
        await sleep(1000);
      }
    }
    if (!manifest) {
      throw new Error('Failed to get manifest');
    }
    if (manifest.type) {
      await DeviceModel.updateDeviceType(deviceId, manifest.type);
    }
    EventsObserver.listener({ type: 'createDevice', data: appId });
    return true;
  }
}

export default DeviceAction;