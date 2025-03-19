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
    if (!this.ctx?.user?.id || await new User(this.ctx).amIRootUser()) {
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
    if (roleId == User.rootRoleId) {
      return;
    }

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

  async revoke(id: string): Promise<boolean> {
    const privilege = (await this.getByFields({ id }))[0];
    if (!privilege) {
      return false;
    }

    if (privilege.group_user_id == User.rootRoleId
      || privilege.group_user_id == this.ctx.user.group_user_id) {
      this._throwAccessDenied();
    }

    const deletePrivilege = () => knex(this.getTable()).where({ id }).delete();

    if (privilege.action == '*') {
      if (!await new User(this.ctx).amIRootUser()) {
        this._throwAccessDenied();
      } else {
        await deletePrivilege();
      }
    } else {
      if (!await RightsChecker.check(this.ctx.user.id, {
        resourceType: privilege.object_name,
        resourceId: privilege.object_id,
        action: '*',
      })) {
        this._throwAccessDenied();
      } else {
        await deletePrivilege();
      }
    }
  }
}

export default UserGroupPrivilege;
