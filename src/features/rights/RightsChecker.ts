import { IEntity } from '../db/tables';
import { UserAction } from './resources.list';
import { GroupUserPrivilege } from '../../domain/entities/GroupUserPrivilege.entity';
import UserRepo from '../repository/user/user.repository';

export class RightsChecker {
  static async check(userId: string, action: UserAction): Promise<boolean> {
    if (!userId) {
      return true;
    }

    const privileges = await RightsChecker._getPrivileges(userId);
    return RightsChecker.privilegesIsMatch(privileges, action);
  }

  static async filter<T extends IEntity>(
    userId: string,
    action: UserAction,
    entities: T[]
  ): Promise<T[]> {
    if (!userId) {
      return entities;
    }

    const privileges = await RightsChecker._getPrivileges(userId);
    let entitiesFiltered = entities.filter((entity) =>
      RightsChecker.privilegesIsMatch(privileges, {
        resourceType: action.resourceType,
        resourceId: entity.id,
        action: action.action,
      })
    );
    return entitiesFiltered;
  }

  static _getPrivileges(userId: string) {
    return new UserRepo(undefined, userId).getPrivileges();
  }

  static privilegeIsMatch(
    privilege: GroupUserPrivilege,
    action: UserAction
  ): boolean {
    return (
      (privilege.objectName == '*' ||
        privilege.objectName == action.resourceType) &&
      (privilege.objectId == '*' || privilege.objectId == action.resourceId) &&
      (privilege.action == '*' || privilege.action == action.action)
    );
  }

  static privilegesIsMatch(
    privileges: GroupUserPrivilege[],
    action: UserAction
  ): boolean {
    let value = privileges.some((p) =>
      RightsChecker.privilegeIsMatch(p, action)
    );
    return value;
  }
}
