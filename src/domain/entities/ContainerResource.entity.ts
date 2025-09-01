import { Entity, ManyToOne, type Opt, PrimaryKey } from '@mikro-orm/core';
import { Container } from './Container.entity';
import { Resource } from './Resource.entity';

@Entity()
export class ContainerResource {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string & Opt;

  @ManyToOne({ entity: () => Container, defaultRaw: `gen_random_uuid()` })
  container!: Container & Opt;

  @ManyToOne({ entity: () => Resource, defaultRaw: `gen_random_uuid()` })
  resource!: Resource & Opt;
}
