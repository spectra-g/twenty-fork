import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type DashboardFilterPayload } from 'src/modules/dashboard/services/dashboard-preset.service';

@InputType()
export class UpdateDashboardFilterPresetInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  presetId: string;

  @Field(() => GraphQLJSON)
  @IsNotEmpty()
  filter: DashboardFilterPayload;
}
