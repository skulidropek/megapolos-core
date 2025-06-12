import { Resolver } from 'type-graphql';
import { CreateBaseResolver } from '../base.resolver';
import { Domain } from '../../../domain/entities/Domain.entity';
import DomainRepo from '../../../features/repository/domain.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';

// Генерируем Input типы
export const DomainInput = generateGraphQLInputType(
  Domain,
  'DomainInput',
  GenerationType.input
);

export const DomainUpdateInput = generateGraphQLInputType(
  Domain,
  'DomainUpdateInput',
  GenerationType.update
);

@Resolver()
export class DomainResolver extends CreateBaseResolver(
  'Domain',
  DomainRepo,
  Domain,
  DomainInput,
  DomainUpdateInput
) {}
