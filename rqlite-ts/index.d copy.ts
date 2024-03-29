declare module 'rqlite-js';

declare module _default {
  export { DataApiClient };
  export { BackupApiClient };
  export { StatusApiClient };
}
export default _default;
import DataApiClient from './api/data';
import BackupApiClient from './api/backup';
import StatusApiClient from './api/status';
