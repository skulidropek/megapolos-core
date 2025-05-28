import { EntityData, FilterQuery, RequiredEntityData } from '@mikro-orm/core';
import { Context } from '../../api/graphql/server';
import { BaseEntity } from '../../domain/entities/Base.entity';
import { makeEm } from '../db/mikro-orm';
import {
  defaultRights,
  resources,
  ResourceType,
} from '../rights/resources.list';
import { RightsChecker } from '../rights/RightsChecker';

export default abstract class BaseRepo<Entity extends BaseEntity> {
  private _entity?: Entity;

  constructor(
    public ctx: Context = undefined,
    public id: string = undefined,
    public checkRights: boolean = true
  ) {}

  abstract get entityClass(): typeof BaseEntity;

  get resourceType(): ResourceType | undefined {
    return undefined;
  }

  get entityName(): string {
    return this.entityClass.name;
  }

  async getEntity(update: boolean = false): Promise<Entity> {
    if (!update && this._entity) {
      return this._entity;
    }
    this._checkIdIsSet();

    await this.checkActionAccess(defaultRights.read);
    this._entity = (await makeEm().findOne(this.entityClass, {
      id: this.id,
    })) as Entity;
    return this._entity;
  }

  async getAll(): Promise<Entity[]> {
    const entities = (await makeEm().findAll(this.entityClass)) as Entity[];
    return this.filterEntitiesByAccess(entities);
  }

  async getByFields(fields: FilterQuery<Entity>): Promise<Entity[]> {
    const entities = (await makeEm().find(
      this.entityClass,
      fields
    )) as Entity[];
    return this.filterEntitiesByAccess(entities);
  }

  // CRUD
  async create(entity: RequiredEntityData<Entity>): Promise<Entity> {
    await this.checkActionAccess(defaultRights.create);
    const em = makeEm();
    const created = em.create(this.entityClass, entity);
    await em.persistAndFlush(created);
    this.id = created.id;

    const UserGroupPrivilegeRepo = (
      await import('./user/user.group.privilege.repository')
    ).default;

    if (!!resources[this.entityName]) {
      await new UserGroupPrivilegeRepo(this.ctx).create({
        groupUser: this.ctx.user.groupUser.id,
        objectName: this.entityName,
        objectId: this.id,
        action: '*',
      });
    }

    return created as Entity;
  }

  async update(entity: EntityData<Entity>): Promise<boolean> {
    await this.checkActionAccess(defaultRights.edit);
    this._checkIdIsSet();
    return (
      (await makeEm().nativeUpdate(
        this.entityClass,
        {
          id: this.id,
        },
        entity
      )) > 0
    );
  }

  async delete(): Promise<boolean> {
    await this.checkActionAccess(defaultRights.remove);
    this._checkIdIsSet();
    return (await makeEm().nativeDelete(this.entityClass, { id: this.id })) > 0;
  }

  // RIGHTS CHECKERS
  async haveActionAccess(action: string): Promise<boolean> {
    if (!this.checkRights) {
      return true;
    }

    if (!this.resourceType || !resources[this.resourceType]) {
      return true;
    }

    return RightsChecker.check(this.ctx?.user?.id, {
      resourceType: this.entityName,
      resourceId: this.id,
      action,
    });
  }

  async checkActionAccess(action: string) {
    if (!(await this.haveActionAccess(action))) {
      this._throwAccessDenied();
    }
  }

  async filterEntitiesByAccess(entities: Entity[]): Promise<Entity[]> {
    if (!resources[this.entityName]) {
      return entities;
    }

    return RightsChecker.filter(
      this.ctx?.user?.id,
      {
        resourceType: this.entityName,
        resourceId: '*',
        action: defaultRights.read,
      },
      entities
    );
  }

  protected _throwAccessDenied() {
    throw new Error(
      'Access denied (entity: ' +
        this.entityName +
        ', uuid: ' +
        this.id +
        ', userId: ' +
        this.ctx?.user?.id +
        ')'
    );
  }

  protected _checkIdIsSet() {
    if (!this.id) {
      throw new Error('Id is not set');
    }
  }
}
