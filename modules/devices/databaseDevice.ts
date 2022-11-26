import BaseDevice from './baseDevice';

class DatabaseDevice extends BaseDevice {
  async add(userId: string) {
    return this.request('/databases/add', {
      user_id: userId,
    });
  }

  async remove(userId: string) {
    return this.request('/databases/remove', {
      user_id: userId,
    });
  }
}

export default DatabaseDevice;