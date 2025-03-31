import { Entity, type Opt, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class InstanceType {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @Property({ length: -1, unique: 'instance_type_name_key' })
  name!: string;
}
