/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import config from '../../config/config.json';
import UserModel from '../models/user.model';

class UserAction {
    
  static createToken(userId: string): string {
    return jwt.sign({ id: userId }, config.secret);
  }

  static async createRoot() {
    let admins = await UserModel.getUsersByRole('root');
    if (!admins.length) {
      await UserModel.createUser({
        groupUserId: 'root',
        name: 'root',
        id: uuidv4(),
      });
      admins = await UserModel.getUsersByRole('root');
    }
    console.log(UserAction.createToken(admins[0].id));
  }
}

export default UserAction;