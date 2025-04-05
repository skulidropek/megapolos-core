import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Container } from './Container.entity';
import { Db } from './Db.entity';
import { DbUser } from './DbUser.entity';
import { BaseEntity } from './Base.entity';
import { Field, ObjectType } from 'type-graphql';
import { Hint } from '../../library/graphql_types_generator';

@ObjectType()
@Entity()
export class ContainerDb extends BaseEntity {
  @Field(() => Db)
  @ManyToOne({ entity: () => Db })
  @Hint({ skip: true })
  db!: Db;

  @Field(() => DbUser)
  @ManyToOne({ entity: () => DbUser })
  @Hint({ skip: true })
  dbUser!: DbUser;

  @Field(() => Container)
  @ManyToOne({ entity: () => Container })
  @Hint({ skip: true })
  container!: Container;

  @Field()
  @Property({ length: -1 })
  name!: string;
}
