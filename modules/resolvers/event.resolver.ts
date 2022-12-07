import { TypedRequestBody } from '../../types';
import { MegapolosEvent } from '../events/event';
import EventsObserver from '../events/eventsObserver';
import BaseController from './base.controller';

class EventController extends BaseController {
  // @refactor to event protocol
  initializeRoutes(): void {
    this.expressApp.post('/events/submit', async (req:TypedRequestBody<MegapolosEvent>, res) => {
      EventsObserver.listener(req.body);
    });
  }
}

export default EventController;