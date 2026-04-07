/* eslint-disable @nx/enforce-module-boundaries */
import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsString, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { type ChartFilter } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateDashboardPresetInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  dashboardId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  // @clawdence-stub: STORY-125 - Add DTO validation for filter payload schema and name uniqueness
  @Field(() => GraphQLJSON)
  @IsObject()
  filter: ChartFilter;
}
