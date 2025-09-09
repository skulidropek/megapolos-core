import { RightsChecker } from '../../rights/RightsChecker';
import BaseRepo from '../base.repository';
import { GroupUserPrivilege } from '../../../domain/entities/GroupUserPrivilege.entity';
import UserRepo from './user.repository';
import { makeEm } from '../../db/mikro-orm';

export default class UserGroupPrivilegeRepo extends BaseRepo<GroupUserPrivilege> {
  get entityClass() {
    return GroupUserPrivilege;
  }

  async getPrivilegesByObjectId(
    objectId: string
  ): Promise<GroupUserPrivilege[]> {
    return await this.getByFields({ objectId: objectId });
  }

  async pushOwner(resourceType: string, resourceId: string) {
    if (!this.ctx?.user?.id || (await new UserRepo(this.ctx).amIRootUser())) {
      return;
    }

    const user = await new UserRepo(this.ctx, this.ctx.user.id).getEntity();
    await this.pushForResource(
      user.groupUser.id,
      resourceType,
      resourceId,
      '*',
      false
    );
  }

  async pushForResource(
    roleId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    checkAccess: boolean = true
  ) {
    if (roleId == UserRepo.rootRoleId) {
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
      groupUser: roleId,
      objectName: resourceType,
      objectId: resourceId,
    });

    if (
      RightsChecker.privilegesIsMatch(privileges, {
        resourceType,
        resourceId,
        action,
      })
    ) {
      return;
    }

    if (action == '*') {
      await makeEm().nativeDelete(GroupUserPrivilege, {
        groupUser: roleId,
        objectName: resourceType,
        objectId: resourceId,
      });
    }

    await this.create({
      groupUser: roleId,
      objectName: resourceType,
      objectId: resourceId,
      action: action,
    });
  }

  async revoke(id: string): Promise<boolean> {
    const privilege = (await this.getByFields({ id }))[0];
    if (!privilege) {
      return false;
    }

    if (
      privilege.groupUser.id == UserRepo.rootRoleId ||
      privilege.groupUser.id == this.ctx.user.groupUser.id
    ) {
      this._throwAccessDenied();
    }

    const deletePrivilege = () =>
      makeEm().nativeDelete(GroupUserPrivilege, { id });

    if (privilege.action == '*') {
      if (!(await new UserRepo(this.ctx, this.ctx.user.id).amIRootUser())) {
        this._throwAccessDenied();
      } else {
        await deletePrivilege();
      }
    } else {
      if (
        !(await RightsChecker.check(this.ctx.user.id, {
          resourceType: privilege.objectName,
          resourceId: privilege.objectId,
          action: '*',
        }))
      ) {
        this._throwAccessDenied();
      } else {
        await deletePrivilege();
      }
    }
  }
}
