import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserTable } from '../modules/models/tables';
import UserModel from '../modules/models/user.model';
import { promisify } from 'util';

const exec =   promisify(require('child_process').exec);

import config from '../config/config.json';

class User {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  static async createUser(input: { name: string, groupUserId: string }, isDevice = false):Promise<User> {
    const id = uuidv4();
    let linuxUserId = '';
    if (isDevice) {
      await exec(`useradd -m -s /bin/bash ${id.replace(/-/g, '')}`);
      linuxUserId = (await exec('cat /etc/passwd')).stdout.
        split('\n').
        filter((user) => user.startsWith(id.replace(/-/g, ''))).
        join('\n').
        split(':')[2];
    }
  
    await UserModel.createUser({
      id,
      name: input.name,
      groupUserId: isDevice ? 'device' : 'app',
      osUserId: linuxUserId,
    });
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