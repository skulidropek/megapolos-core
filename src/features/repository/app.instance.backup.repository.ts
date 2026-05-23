import { AppInstanceBackup } from '../../domain/entities/AppInstanceBackup.entity';
import BaseRepo from './base.repository';

export default class AppInstanceBackupRepo extends BaseRepo<AppInstanceBackup> {
  get entityClass() {
    return AppInstanceBackup;
  }
}
