import { Field, ID, ObjectType } from 'type-graphql';
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Hint } from '../../library/graphql_types_generator';
import { IEntity } from '../../features/db/tables';

@ObjectType()
@Entity({ abstract: true })
export abstract class BaseEntity implements IEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  @Field(() => ID)
  @Hint({ skipOnInput: true })
  id!: string;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  @Field({ nullable: true })
  @Hint({ skip: true })
  createDate?: Date;

  @Property({ columnType: 'timestamp(6)', nullable: true, defaultRaw: `now()` })
  @Field({ nullable: true })
  @Hint({ skip: true })
  updateDate?: Date;

  get create_date(): Date {
    return this.createDate;
  }

  get update_date(): Date {
    return this.updateDate;
  }
}
