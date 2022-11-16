declare module 'rqlite-js' {
  import DataApiClient from './api/data';
  import BackupApiClient from './api/backup';
  import StatusApiClient from './api/status';
    
  export { DataApiClient };
  export { BackupApiClient };
  export { StatusApiClient };
}
