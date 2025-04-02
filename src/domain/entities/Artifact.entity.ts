import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './Base.entity';

@Entity()
export class Artifact extends BaseEntity {
  @Property({ length: -1 })
  name!: string;

  @Property({ length: -1, nullable: true })
  type?: string;
}
