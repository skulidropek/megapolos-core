import { MegapolosEvent } from '../events/event';
import EventsObserver from '../events/eventsObserver';
import BaseController from './base.controller';

class EventController extends BaseController {
  // @refactor to event protocol
  initializeRoutes(): void {
    this.expressApp.post('/events/submit', async (req, res) => {
      EventsObserver.listener(req.body as MegapolosEvent);
    });
  }
}

export default EventController;