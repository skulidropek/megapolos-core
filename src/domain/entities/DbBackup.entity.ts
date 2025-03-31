import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Artifact } from './Artifact.entity';

@Entity()
export class DbBackup {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1 })
  name!: string;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true })
  updateDate?: Date;

  @Property({ length: -1, nullable: true })
  type?: string;

  @Property({ type: 'text', nullable: true })
  backup?: string;

  @ManyToOne({ entity: () => Artifact, nullable: true })
  artifact?: Artifact;
}
