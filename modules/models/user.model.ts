/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import coreRqlite from '../../coreRqlite';
import { UserTable } from './tables';

class UserModel {
  static async getUsers():Promise<(UserTable & { user: string })[]> {
    return (await coreRqlite.query(`
    SELECT u.*, u.group_user_id as role FROM user u
    LEFT JOIN group_user g ON g.id = u.group_user_id
    `)).toArray();
  }

  static async getUsersByRole(role: string):Promise<UserTable[]> {
    return (await coreRqlite.query([[`
    SELECT u.* FROM user u
    LEFT JOIN group_user g ON g.id = u.group_user_id
    WHERE g.name = ?
  `, role]])).toArray();
  }

  static async getUserById(userId: string):Promise<UserTable> {
    return (await coreRqlite.query([['SELECT * FROM user WHERE id = ?', userId]])).toArray()[0];
  }

  static async createUser(input: { id: string, name: string, groupUserId: string, osUserId?: string }) {
    await coreRqlite.execute([[`
            INSERT INTO user (id, name, group_user_id, os_user_id) VALUES (?, ?, ?, ?)
        `, input.id, 'app_' + input.name, input.groupUserId, input.osUserId || '']]);
  }

  static async removeUser(userId: string) {
    await coreRqlite.execute([[
      'DELETE FROM user WHERE id = ?', userId]]);
  }
}

export default UserModel;