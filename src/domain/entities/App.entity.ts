import { Entity, ManyToOne, type Opt, Property } from '@mikro-orm/core';
import { User } from './User.entity';
import { ObjectType, Field, ID } from 'type-graphql';
import { BaseEntity } from './Base.entity';
import { Hint } from '../../library/graphql_types_generator';

@Entity()
@ObjectType()
export class App extends BaseEntity {
  @Property({ length: -1, unique: 'app_name_key' })
  @Field()
  name!: string;

  @Property({ length: -1 })
  @Field()
  description!: string;

  @ManyToOne({ entity: () => User })
  @Field(() => User)
  @Hint({ type: () => ID, skipOnUpdate: true, skipOnInput: true })
  ownerUser!: User & Opt;

  @Property({ type: 'string', length: -1, nullable: true })
  @Field({ nullable: true })
  status?: string = 'stoppd';
}
