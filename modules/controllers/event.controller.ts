import { MegapolosEvent } from "../events/event";
import EventsObserver from "../events/eventsObserver";

class EventController {
    // @refactor to event protocol
    submit() {
        express.post('/events/submit', async (req, res) => {
            EventsObserver.listener(req.body as MegapolosEvent);
        }
    }
}