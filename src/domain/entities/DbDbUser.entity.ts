import { Entity, ManyToOne, type Opt, PrimaryKey } from '@mikro-orm/core';
import { GroupUser } from './GroupUser.entity';
import { User } from './User.entity';
import { Db } from './Db.entity';
import { DbUser } from './DbUser.entity';

@Entity()
export class DbDbUser {
  @ManyToOne({ primary: true, entity: () => Db })
  db!: Db;

  @ManyToOne({ primary: true, entity: () => DbUser })
  dbUser!: DbUser;
}
