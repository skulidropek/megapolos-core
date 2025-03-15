import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { GroupUserTable, UserTable } from '../modules/models/tables';
import { promisify } from 'util';

const exec =   promisify(require('child_process').exec);

import config from '../config/config';
import EventsObserver from '../modules/events/eventsObserver';
import BaseRepository from './BaseRepository';
import UserGroup from './UserGroup';

class User extends BaseRepository<UserTable> {
  
  getTable(): string {
    return 'user';
  }

  async create(data: Partial<UserTable>):Promise<UserTable> {
    let linuxUserId = '';
    return super.create({
      ...data,
      os_user_id: linuxUserId,
    });
  }

  async createRootUser():Promise<User> {
    let admins = await this.getByGroupName('root');
    if (!admins.length) {
      let rootGroup = (await new UserGroup().getByFields({ name: 'root' }))[0];
      if (!rootGroup) {
        rootGroup = await new UserGroup().create({ name: 'root' });
      }
      console.log(rootGroup);
      await this.create({ name: 'root', group_user_id: rootGroup.id, os_user_id: '' });
      admins = await this.getByGroupName('root');
    }
    return new User(admins[0].id);
  }

  async getUsersWithToken():Promise<(UserTable & { token?: string })[]> {
    const users = await this.getAll();
    return Promise.all(users.map((user) => new User(user.id).getDataWithToken()));
  }

  async getDataWithToken():Promise<UserTable & { token?: string }> {
    const result: UserTable & { token?: string } = await this.getData();
    result.token = jwt.sign({ id: result.id }, config.secret);
    return result;
  }

  createToken(): string {
    return jwt.sign({ id: this.id }, config.secret);
  }

  async getGroup():Promise<GroupUserTable> {
    const data = await this.getData();
    return new UserGroup(data.group_user_id).getData();
  }

  async getByGroupName(groupName: string):Promise<UserTable[]> {
    const group = await new UserGroup().getByFields({ name: groupName });
    if (!group.length) {
      return [];
    }
    return this.getByFields({ group_user_id: group[0].id });
  }

  async delete():Promise<boolean> {
    const data = await this.getData();
    await super.delete();
  
    if (data.os_user_id) {
      try {
        // await exec(`userdel -r ${this.id.replace(/-/g, '')}`);
      } catch (e) {
        console.trace(e);
        EventsObserver.listener({ type: 'error', data: e });
      }
    }

    return true;
  }
}

export default User;