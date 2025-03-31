import {
  Entity,
  ManyToOne,
  type Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from './User.entity';

@Entity()
export class App {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1, unique: 'app_name_key' })
  name!: string;

  @ManyToOne({ entity: () => User, defaultRaw: `gen_random_uuid()` })
  ownerUser!: User & Opt;

  @Property({ type: 'string', length: -1, nullable: true })
  status?: string = 'stoppd';

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  updateDate?: Date;
}
