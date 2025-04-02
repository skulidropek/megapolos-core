import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './Base.entity';

@Entity()
export class Log extends BaseEntity {
  @Property({ length: -1 })
  name!: string;

  @Property({ type: 'boolean', nullable: true })
  isClosed?: boolean = false;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  closeDate?: Date;

  @Property({ type: 'uuid', nullable: true })
  containerId?: string;

  @Property({ length: -1, nullable: true })
  containerName?: string;

  @Property({ type: 'uuid', nullable: true })
  nodeId?: string;

  @Property({ length: -1, nullable: true })
  nodeName?: string;

  @Property({ type: 'uuid', nullable: true })
  objectId?: string;

  @Property({ length: -1, nullable: true })
  objectName?: string;

  @Property({ length: -1, nullable: true })
  type?: string;
}
