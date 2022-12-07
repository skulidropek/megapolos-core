import { gql } from 'graphql-request';
import BaseDevice from './baseDevice';

class DatabaseDevice extends BaseDevice {
  async add(userId: string) {
    return this.client.request(gql`
      mutation($userId: String) {
        addDatabase(userId: $userId)
      }
    `, { userId });
  }

  async remove(userId: string) {
    return this.client.request(gql`
      mutation($userId: String) {
        removeDatabase(userId: $userId)
      }
    `, { userId });
  }
}

export default DatabaseDevice;