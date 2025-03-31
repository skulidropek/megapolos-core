import { Entity, ManyToOne, type Opt, PrimaryKey } from '@mikro-orm/core';
import { GroupUser } from './GroupUser';
import { User } from './User';

@Entity()
export class UserGroupLink {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => User })
  user!: User;

  @ManyToOne({ entity: () => GroupUser })
  groupUser!: GroupUser;
}
