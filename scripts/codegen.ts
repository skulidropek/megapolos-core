import { Project, ClassDeclaration, PropertyDeclaration } from 'ts-morph';

enum EntityType {
  Input = 'Input',
  Partial = 'Partial',
  InputPartial = 'InputPartial',
}

function handleClass(cls: ClassDeclaration, entityType: EntityType) {
  const isInputPartial =
    entityType === EntityType.InputPartial || entityType === EntityType.Partial;

  for (const field of cls.getProperties()) {
    handleField(field, entityType);
  }

  cls.getDecorators().forEach((decorator) => {
    if (decorator.getText().includes('@Entity')) {
      decorator.remove();
    } else if (decorator.getText().includes('@ObjectType')) {
      decorator.remove();
    }
  });

  if (isInputPartial) {
    cls.addDecorator({ name: 'InputType' });
  }

  cls.rename(cls.getName() + entityType);
}

function handleField(field: PropertyDeclaration, entityType: EntityType) {
  let haveField = false;
  const decorators = field.getDecorators();
  const isPartial =
    entityType === EntityType.InputPartial || entityType === EntityType.Partial;
  const isInput =
    entityType === EntityType.Input || entityType === EntityType.InputPartial;

  // Удаляем значение по умолчанию
  field.removeInitializer();
  if (isPartial) {
    field.setHasExclamationToken(false);
    field.setHasQuestionToken(true);
  }

  for (const decorator of decorators) {
    if (decorator.getText().includes('@Field')) {
      if (
        isPartial &&
        !decorator.getText().replace(/\s+/g, '').includes('{nullable:true}')
      ) {
        decorator.addArgument(`{ nullable: true }`);
      }
      haveField = true;
    } else if (decorator.getText().includes('@PrimaryKey') && isInput) {
      field.remove();
      return;
    } else if (
      decorator.getText().includes('@Property') ||
      decorator.getText().includes('@ManyToOne')
    ) {
      decorator.remove();
    }
  }

  if (!haveField) {
    field.remove();
  }
}

function handleFile(fileName: string) {
  const types = [EntityType.Input, EntityType.Partial, EntityType.InputPartial];

  for (const type of types) {
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(fileName);
    for (let i = 0; i < sourceFile.getClasses().length; i++) {
      const cls = sourceFile.getClasses()[i];
      handleClass(cls, type);
      console.log('--------------------------------');
      console.log(type);
      console.log(cls.getText());
    }
  }
}

import * as path from 'path';
import { readdir } from 'fs/promises';

async function main() {
  const folderPath = path.join('./', 'src', 'domain', 'entities');
  const entityFiles = (await readdir(folderPath))
    .filter(
      (file) => file.endsWith('.entity.ts') && file.includes('User.entity.ts')
    )
    .map((file) => './src/domain/entities/' + file);
  console.log(entityFiles);

  for (const file of entityFiles) {
    handleFile(file);
  }
}

main();
