import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserTable } from '../modules/models/tables';
import UserModel from '../modules/models/user.model';

import config from '../config/config.json';

class User {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  getData():Promise<UserTable> {
    return UserModel.getUserById(this.id);
  }

  createToken(): string {
    return jwt.sign({ id: this.id }, config.secret);
  }

  static async createRootUser():Promise<User> {
    let admins = await UserModel.getUsersByRole('root');
    if (!admins.length) {
      await UserModel.createUser({
        groupUserId: 'root',
        name: 'root',
        id: uuidv4(),
      });
      admins = await UserModel.getUsersByRole('root');
    }
    console.log(new User(admins[0].id).createToken());
    return new User(admins[0].id);
  }
}

export default User;