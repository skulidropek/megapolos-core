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

  static async createUser(input: { name: string, groupUserId: string }):Promise<User> {
    const id = uuidv4();
    await UserModel.createUser({ id, name: input.name, groupUserId: input.groupUserId });
    return new User(id);
  }

  static async createRootUser():Promise<User> {
    let admins = await UserModel.getUsersByRole('root');
    if (!admins.length) {
      await User.createUser({ name: 'root', groupUserId: 'root' });
      admins = await UserModel.getUsersByRole('root');
    }
    console.log(new User(admins[0].id).createToken());
    return new User(admins[0].id);
  }

  static async getUsersWithToken():Promise<(UserTable & { token?: string })[]> {
    const users = await UserModel.getUsers();
    return Promise.all(users.map((user) => new User(user.id).getDataWithToken()));
  }

  getData():Promise<UserTable> {
    return UserModel.getUserById(this.id);
  }

  async getDataWithToken():Promise<UserTable & { token?: string }> {
    const result: UserTable & { token?: string } = await UserModel.getUserById(this.id);
    result.token = jwt.sign({ id: result.id }, config.secret);
    return result;
  }

  createToken(): string {
    return jwt.sign({ id: this.id }, config.secret);
  }
}

export default User;