import { GraphQLSchemaGenerator } from './codegen';
import { MikroORM } from '@mikro-orm/core';

const generator = new GraphQLSchemaGenerator(orm.em);
const schema = generator.generateSchema('User');
console.log(schema);
