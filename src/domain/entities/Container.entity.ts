import {
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  ManyToOne,
  type Opt,
  Property,
} from '@mikro-orm/core';
import { Field, ID, ObjectType } from 'type-graphql';
import { AppInstance } from './AppInstance.entity';
import { Domain } from './Domain.entity';
import { Image } from './Image.entity';
import { Node } from './Node.entity';
import { BaseEntity } from './Base.entity';
import { Hint } from '../../library/graphql_types_generator';
import { ContainerVolume } from './ContainerVolume.entity';
import { ContainerEnvOption } from './ContainerEnvOption.entity';

@ObjectType()
@Entity()
export class Container extends BaseEntity {
  @Field()
  @Property({ length: -1, unique: 'container_name_key' })
  name!: string;

  @Field(() => Image)
  @ManyToOne({ entity: () => Image })
  @Hint({ type: () => ID })
  image!: Image;

  @Field(() => Node)
  @ManyToOne({ entity: () => Node })
  @Hint({ type: () => ID })
  node!: Node;

  @Field({ nullable: true })
  @Property({ nullable: true })
  outerPort?: number;

  @Field(() => AppInstance)
  @ManyToOne({ entity: () => AppInstance })
  @Hint({ type: () => ID })
  appInstance!: AppInstance;

  @Field(() => String)
  @Property({ type: 'string', length: -1 })
  @Hint({ skipOnInput: true })
  lifeStatus: string & Opt = 'stopped';

  @Field({ nullable: true })
  @Property({ columnType: 'timestamp(6)', nullable: true })
  removeDate?: Date;

  @Field({ nullable: true })
  @Property({ length: -1, nullable: true })
  dockerRuntimeId?: string;

  @Field(() => Domain, { nullable: true })
  @ManyToOne({ entity: () => Domain, nullable: true })
  @Hint({ type: () => ID })
  domain?: Domain;

  @Field(() => [ContainerVolume])
  @OneToMany({
    entity: () => ContainerVolume,
    mappedBy: 'container',
  })
  @Hint({ skip: true })
  volumes = new Collection<ContainerVolume>(this);

  @Field(() => [ContainerEnvOption])
  @OneToMany({
    entity: () => ContainerEnvOption,
    mappedBy: 'container',
  })
  @Hint({ skip: true })
  envs = new Collection<ContainerEnvOption>(this);

  @Property({ type: 'boolean', default: false, fieldName: 'show_on_desktop' })
  @Field(() => Boolean)
  showOnDesktop: boolean = false;
}
