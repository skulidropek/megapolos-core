/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { knex } from '../../coreRqlite';
import { UserTable } from './tables';

class UserModel {
  static async getUsers():Promise<(UserTable & { user: string })[]> {
    return knex<UserTable>('user').select('user.*', 'group_user.name as role')
      .leftJoin('group_user', 'group_user.id', 'user.group_user_id');
  }

  static async getUsersByRole(role: string):Promise<UserTable[]> {
    return knex<UserTable>('user').select('user.*')
      .leftJoin('group_user', 'group_user.id', 'user.group_user_id')
      .where('group_user.name', role);
  }

  static async getUserById(userId: string):Promise<UserTable> {
    return knex<UserTable>('user').select('user.*').where('user.id', userId).first();
  }

  static async createUser(input: { id: string, name: string, groupUserId: string, osUserId?: string }) {
    await knex.table<UserTable>('user').insert({ id: input.id,
      name: 'app_' + input.name,
      group_user_id: input.groupUserId,
      os_user_id: input.osUserId || '' });
  }

  static async removeUser(userId: string) {
    await knex.table<UserTable>('user').delete().where('id', userId);
  }
}

export default UserModel;