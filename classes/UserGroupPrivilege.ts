import { knex } from '../corePostgres';
import { GroupUserPrivilegeTable } from '../modules/models/tables';
import { RightsChecker } from '../src/features/rights/rights_checker';
import BaseRepository from './BaseRepository';
import User from './User';

class UserGroupPrivilege extends BaseRepository<GroupUserPrivilegeTable> {
  getTable(): string {
    return 'group_user_privilege';
  }

  async pushOwner(resourceType: string, resourceId: string) {
    if (!this.ctx?.user?.id || User.isRootUser(this.ctx.user.id)) {
      return;
    }

    const user = await new User(this.ctx, this.ctx.user.id).getData();
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
        !(await RightsChecker.check(this.ctx?.user?.id, {
          resourceType,
          resourceId,
          action: '*',
        }))
      ) {
        this._throwAccessDenied();
      }
    }

    const privileges = await this.getByFields({
      group_user_id: roleId,
      object_name: resourceType,
      object_id: resourceId,
    });

    if (RightsChecker.privilegesIsMatch(privileges, {
      resourceType,
      resourceId,
      action,
    })) {
      return;
    }

    if (action == '*') {
      await knex(this.getTable()).where({
        group_user_id: roleId,
        object_name: resourceType,
        object_id: resourceId,
      }).delete();
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
