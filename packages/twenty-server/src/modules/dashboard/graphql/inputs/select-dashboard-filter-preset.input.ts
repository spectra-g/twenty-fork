import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class SelectDashboardFilterPresetInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  presetId: string;
}
