import { v4 as uuidv4 } from 'uuid';
import { AppInput } from '../../types';
import AppModel from '../models/app.model';
import EventsObserver from '../events/eventsObserver';

class AppAction {
  static async installApp(userId, input: AppInput) {
    const appId = uuidv4();
      
    await AppModel.createApp({
      id: appId,
      ownerUserId: userId,
      name: input.name,
    });
    for (let i in input.images) {
      const image = input.images[i];
      const imageId = uuidv4();
      await AppModel.createImage({
        imageId,
        name: image.name,
        appId,
        repository: image.repository,
        commitId: '',
        innerPort: image.inner_port,
      });
    }
    EventsObserver.listener({ 'type': 'installApp', data: { userId, input } });
    return appId;
  }  

  static async uninstallApp(appId) {
    const images = await AppModel.getImagesOfApp(appId);
  
    for (let i in images) {
      const image = images[i];
      await AppModel.removeImage(image.id);
    }
  
    await AppModel.removeApp(appId);
    EventsObserver.listener({ 'type': 'uninstallApp', data: { appId } });
  }
}

export default AppAction;