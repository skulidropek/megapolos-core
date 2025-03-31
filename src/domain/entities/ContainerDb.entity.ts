import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Container } from './Container.entity';
import { Db } from './Db.entity';
import { DbUser } from './DbUser.entity';

@Entity()
export class ContainerDb {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => Db })
  db!: Db;

  @ManyToOne({ entity: () => DbUser })
  dbUser!: DbUser;

  @ManyToOne({ entity: () => Container })
  container!: Container;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  updateDate?: Date;

  @Property({ length: -1 })
  name!: string;
}
