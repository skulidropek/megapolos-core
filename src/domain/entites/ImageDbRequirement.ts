import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { DbBackup } from './DbBackup';

@Entity()
export class ImageDbRequirement {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  updateDate?: Date;

  @Property({ length: -1, nullable: true })
  dbmsType?: string;

  @ManyToOne({ entity: () => DbBackup, nullable: true })
  dbBackup?: DbBackup;

  @Property({ length: -1, nullable: true })
  name?: string;
}
