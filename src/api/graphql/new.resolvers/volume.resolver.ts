import { Mutation, Ctx, Resolver, Arg, InputType, Field } from 'type-graphql';
import { CreateBaseResolver, BaseTableResolver } from '../base.resolver';
import { Volume } from '../../../domain/entities/Volume.entity';
import { ContainerVolume } from '../../../domain/entities/ContainerVolume.entity';
import { Context } from '../server';
import VolumeRepo from '../../../features/new.repository/volume.repository';
import {
  generateGraphQLInputType,
  GenerationType,
} from '../../../library/graphql_types_generator';
import { RequiredEntityData } from '@mikro-orm/core';
import { ContainerRepo } from '../../../features/new.repository/cantainer/container.repository';

export const ContainerVolumeInput = generateGraphQLInputType(
  ContainerVolume,
  'ContainerVolumeInput',
  GenerationType.input
);

// Генерируем Input типы
export const VolumeInput = generateGraphQLInputType(
  Volume,
  'VolumeInput',
  GenerationType.input
);

export const VolumeUpdateInput = generateGraphQLInputType(
  Volume,
  'VolumeUpdateInput',
  GenerationType.update
);

@InputType()
export class FileUploadInput {
  @Field()
  filename: string;

  @Field()
  data: string;
}

@Resolver()
export class VolumeResolver extends CreateBaseResolver(
  'Volume',
  VolumeRepo,
  Volume,
  VolumeInput,
  VolumeUpdateInput
) {
  @Mutation(() => Boolean)
  async addVolumeToContainer(
    @Arg('containerId') containerId: string,
    @Arg('input', () => ContainerVolumeInput)
    input: RequiredEntityData<ContainerVolume>,
    @Ctx() ctx: Context
  ): Promise<ContainerVolume> {
    return new VolumeRepo(ctx).addToContainer(containerId, input);
  }

  @Mutation(() => Boolean)
  async removeVolumeFromContainer(
    @Arg('volumeId') volumeId: string,
    @Arg('containerId') containerId: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new ContainerRepo(ctx, containerId).removeVolume(volumeId);
    return true;
  }

  @Mutation(() => Boolean)
  async uploadFileToVolume(
    @Arg('volumeId') volumeId: string,
    @Arg('file', () => FileUploadInput) file: FileUploadInput,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await new VolumeRepo(ctx, volumeId).uploadFile(file.filename, file.data);
    return true;
  }
}
