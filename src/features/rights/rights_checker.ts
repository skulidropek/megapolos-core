import User from '../../../classes/User';
import {
  GroupUserPrivilegeTable,
  IEntity,
} from '../../../modules/models/tables';
import { UserAction } from './resources_list';

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
    entities: T[],
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
      }),
    );
    return entitiesFiltered;
  }

  static _getPrivileges(userId: string) {
    return new User(undefined, userId).getPrivileges();
  }

  static privilegeIsMatch(
    privilege: GroupUserPrivilegeTable,
    action: UserAction,
  ): boolean {
    return (privilege.object_name == '*'
      || privilege.object_name == action.resourceType)
      && (privilege.object_id == '*'
        || privilege.object_id == action.resourceId)
      && (privilege.action == '*' || privilege.action == action.action);
  }

  static privilegesIsMatch(
    privileges: GroupUserPrivilegeTable[],
    action: UserAction,
  ): boolean {
    let value = privileges.some((p) =>
      RightsChecker.privilegeIsMatch(p, action),
    );
    return value;
  }
}
