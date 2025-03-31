import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Artifact } from './Artifact';

@Entity()
export class VolumeBackup {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1 })
  name!: string;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  updateDate?: Date;

  @ManyToOne({ entity: () => Artifact, nullable: true })
  artifact?: Artifact;
}
