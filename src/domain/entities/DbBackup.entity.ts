import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Artifact } from './Artifact.entity';
import { BaseEntity } from './Base.entity';

@Entity()
export class DbBackup extends BaseEntity {
  @Property({ length: -1 })
  name!: string;

  @Property({ length: -1, nullable: true })
  type?: string;

  @Property({ type: 'text', nullable: true })
  backup?: string;

  @ManyToOne({ entity: () => Artifact, nullable: true })
  artifact?: Artifact;
}
