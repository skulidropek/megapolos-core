import { Entity, type Opt, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Volume {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1 })
  name!: string;

  @Property({ type: 'string', length: -1 })
  type: string & Opt = 'auto';

  @Property({ length: -1, nullable: true })
  outerPath?: string;

  @Property({ type: 'uuid', nullable: true })
  nodeId?: string;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  updateDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  removeDate?: Date;
}
