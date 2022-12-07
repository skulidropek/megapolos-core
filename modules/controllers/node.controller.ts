import { promisify } from 'util';
const exec = promisify(require('child_process').exec);

import BaseController from './base.controller';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import types, { TypedRequestBody } from '../../types';

class NodeController extends BaseController {
  initializeRoutes(): void {
    const app = this.expressApp;

    app.post('/shell_command', async (req: TypedRequestBody<{ command: string }>, res) => {
      try {
        const osUserId = req.user.os_user_id;
        if (!osUserId) {
          res.status(400).send('No os user id');
          return;
        }
        const command = req.body.command;
        const result = await exec(command,
        // , { uid: parseInt(osUserId) }
        );
        res.send(result);
      } catch (e) {
        console.error(e);
        res.status(400).send('No os user id');
        return;
      }
    });
  }
}

export default NodeController;