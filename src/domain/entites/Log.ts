import { Entity, type Opt, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Log {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1 })
  name!: string;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  updateDate?: Date;

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
