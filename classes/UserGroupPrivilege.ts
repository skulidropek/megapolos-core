import { GroupUserPrivilegeTable } from '../modules/models/tables';
import { defaultRights } from '../src/features/rights/resources_list';
import { RightsChecker } from '../src/features/rights/rights_checker';
import BaseRepository from './BaseRepository';
import User from './User';

class UserGroupPrivilege extends BaseRepository<GroupUserPrivilegeTable> {
  getTable(): string {
    return 'group_user_privilege';
  }

  async pushOwner(resourceType: string, resourceId: string) {
    if (!this.userId || User.isRootUser(this.userId)) {
      return;
    }

    const user = await new User(this.userId).getData();
    await this.pushForResource(
      user.group_user_id,
      resourceType,
      resourceId,
      '*',
      false,
    );
  }

  async pushForResource(
    roleId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    checkAccess: boolean = true,
  ) {
    if (checkAccess) {
      if (
        !(await RightsChecker.check(this.userId, {
          resourceType,
          resourceId,
          action: defaultRights.admin,
        }))
      ) {
        this._throwAccessDenied();
      }
    }
    await this.create({
      group_user_id: roleId,
      object_name: resourceType,
      object_id: resourceId,
      action: action,
    });
  }
}

export default UserGroupPrivilege;
