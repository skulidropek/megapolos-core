import { Entity, type Opt, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Node {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1, unique: 'node_name_key' })
  name!: string;

  @Property({ length: -1 })
  host!: string;

  @Property({ length: -1, nullable: true })
  cpu?: string;

  @Property({ length: -1, nullable: true })
  memory?: string;

  @Property({ type: 'string', length: -1 })
  lifeStatus: string & Opt = 'running';

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  updateDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  removeDate?: Date;

  @Property({ length: -1, nullable: true })
  user?: string;

  @Property({ length: -1, nullable: true })
  password?: string;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  lastUpdateDate?: Date;

  @Property({ columnType: 'varchar[]', nullable: true })
  dockerMirrors?: string[];
}
