/* eslint-disable @nx/enforce-module-boundaries */
import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, IsUUID, Validate } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { type ChartFilter } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { IsChartFilterPayloadValidator } from 'src/modules/dashboard/validators/is-chart-filter-payload.validator';

@InputType()
export class CreateDashboardPresetInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  dashboardId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => GraphQLJSON)
  @Validate(IsChartFilterPayloadValidator)
  filter: ChartFilter;
}
