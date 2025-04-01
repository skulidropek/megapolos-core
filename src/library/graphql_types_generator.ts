import 'reflect-metadata';
import { InputType, Field, getMetadataStorage } from 'type-graphql';

const HINT_METADATA_KEY = Symbol('hintMetadata');

export interface HintMetadata {
  key?: string;
  dbKey?: string;
  defaultValue?: any;
  type?: () => any;
  skipOnInput?: boolean;
  skip?: boolean;
}

export function Hint(metadata: HintMetadata) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(HINT_METADATA_KEY, metadata, target, propertyKey);
  };
}

function getHintMetadata(
  target: any,
  propertyKey: string
): HintMetadata | undefined {
  return Reflect.getMetadata(HINT_METADATA_KEY, target, propertyKey);
}

export enum GenerationType {
  input = 'input',
  partial = 'partial',
  inputPartial = 'inputPartial',
}

const GT = GenerationType;

export function generateGraphQLInputType<T>(
  classType: new () => T,
  inputName: string,
  generationType: GenerationType
) {
  const metadataStorage = getMetadataStorage();
  const fields = metadataStorage.fields.filter((f) => f.target === classType);

  @InputType(inputName)
  class DynamicInput {
    toStruct(): Record<string, any> {
      const result: Record<string, any> = {};
      const instance = this as any;

      metadataStorage.fields
        .filter((f) => f.target === DynamicInput)
        .forEach((field) => {
          const hint = getHintMetadata(DynamicInput.prototype, field.name);
          if (hint && hint.key === null) {
            return;
          }

          const value =
            instance[field.name] === undefined
              ? hint?.defaultValue
              : instance[field.name];

          if (value === undefined) {
            return;
          }
          result[hint?.key || field.name] = value;
        });

      return result;
    }
  }

  const isInput = [GT.input, GT.inputPartial].includes(generationType);
  const isPartial = [GT.partial, GT.inputPartial].includes(generationType);

  fields.forEach((field) => {
    const hint = getHintMetadata(classType.prototype, field.name);
    if (hint?.skip || (hint?.skipOnInput && isInput)) {
      return;
    }

    const fieldOptions = {
      nullable: isPartial ? true : field.typeOptions.nullable || false,
    };

    let type: any;
    if (hint?.type) {
      type = hint.type;
    } else if (field.getType) {
      type = field.getType;
    } else {
      const fieldValue = (classType.prototype as any)[field.name];
      type = () => {
        if (fieldValue instanceof Date) return Date;
        if (typeof fieldValue === 'string') return String;
        if (typeof fieldValue === 'number') return Number;
        return String;
      };
    }

    Field(type, fieldOptions)(DynamicInput.prototype, hint?.key ?? field.name);
    if (hint && (hint.dbKey || hint.defaultValue)) {
      Hint({ key: hint?.dbKey, defaultValue: hint?.defaultValue })(
        DynamicInput.prototype,
        hint?.key ?? field.name
      );
    }
  });

  return DynamicInput as new () => T & {
    toStruct(): Record<string, any>;
  };
}
