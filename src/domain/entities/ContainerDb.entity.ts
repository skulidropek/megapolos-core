import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Container } from './Container.entity';
import { Db } from './Db.entity';
import { DbUser } from './DbUser.entity';
import { BaseEntity } from './Base.entity';

@Entity()
export class ContainerDb extends BaseEntity {
  @ManyToOne({ entity: () => Db })
  db!: Db;

  @ManyToOne({ entity: () => DbUser })
  dbUser!: DbUser;

  @ManyToOne({ entity: () => Container })
  container!: Container;

  @Property({ length: -1 })
  name!: string;
}
