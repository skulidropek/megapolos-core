import BaseRepo from './base.repository';
import { TestCase } from '../../domain/entities/TestCase.entity';

export default class TestCaseRepo extends BaseRepo<TestCase> {
  get entityClass() {
    return TestCase;
  }
}
