import { EntityManager, EntityMetadata } from '@mikro-orm/core';

export class GraphQLSchemaGenerator {
  constructor(private readonly em: EntityManager) {}

  generateSchema(entityName: string) {
    const metadata = this.em.getMetadata().get(entityName);
    if (!metadata) {
      throw new Error(`Entity ${entityName} not found`);
    }
    const typeName = metadata.className;

    return `
      type ${typeName} {
        ${this.generateTypeFields(metadata)}
      }

      input ${typeName}Input {
        ${this.generateInputFields(metadata)} 
      }

      type Query {
        get${typeName}(id: ID!): ${typeName}
        getAll${typeName}s: [${typeName}!]!
        getBy${typeName}Fields(fields: ${typeName}Input!): [${typeName}!]!
      }

      type Mutation {
        create${typeName}(input: ${typeName}Input!): ${typeName}!
        delete${typeName}(id: ID!): Boolean!
      }
    `;
  }

  private generateTypeFields(metadata: EntityMetadata): string {
    let fields = '';

    Object.entries(metadata.properties).forEach(([propertyName, property]) => {
      const type = this.getGraphQLType(property.type);
      fields += `${propertyName}: ${type}${property.nullable ? '?' : ''}\n`;
    });

    return fields;
  }

  private generateInputFields(metadata: EntityMetadata): string {
    let fields = '';

    Object.entries(metadata.properties).forEach(([propertyName, property]) => {
      if (!property.primary) {
        const type = this.getGraphQLType(property.type);
        fields += `${propertyName}: ${type}${property.nullable ? '?' : ''}\n`;
      }
    });

    return fields;
  }

  private getGraphQLType(type: any): string {
    const typeMap: Record<string, string> = {
      string: 'String',
      number: 'Int',
      boolean: 'Boolean',
      Date: 'DateTime',
    };

    return typeMap[type] || 'String';
  }
}