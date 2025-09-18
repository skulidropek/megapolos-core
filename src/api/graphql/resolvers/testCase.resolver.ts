import { Resolver } from 'type-graphql';
import { CreateBaseResolver } from '../base.resolver';
import { TestCase } from '../../../domain/entities/TestCase.entity';
import TestCaseRepo from '../../../features/repository/testCase.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';

// Генерируем Input типы
export const TestCaseInput = generateGraphQLInputType(
  TestCase,
  'TestCaseInput',
  GenerationType.input
);

export const TestCaseUpdateInput = generateGraphQLInputType(
  TestCase,
  'TestCaseUpdateInput',
  GenerationType.update
);

@Resolver()
export class TestCaseResolver extends CreateBaseResolver(
  'TestCase',
  TestCaseRepo,
  TestCase,
  TestCaseInput,
  TestCaseUpdateInput
) {}
