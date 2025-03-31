import { Entity, type Opt, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class RemoveStrategy {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1, unique: 'remove_strategy_name_key' })
  name!: string;
}
