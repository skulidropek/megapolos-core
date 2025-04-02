import { Entity, ManyToOne, type Opt, Property } from '@mikro-orm/core';
import { User } from './User.entity';
import { ObjectType, Field } from 'type-graphql';
import { BaseEntity } from './Base.entity';

@Entity()
@ObjectType()
export class App extends BaseEntity {
  @Property({ length: -1, unique: 'app_name_key' })
  @Field()
  name!: string;

  @ManyToOne({ entity: () => User })
  @Field(() => User)
  ownerUser!: User & Opt;

  @Property({ type: 'string', length: -1, nullable: true })
  @Field({ nullable: true })
  status?: string = 'stoppd';
}
