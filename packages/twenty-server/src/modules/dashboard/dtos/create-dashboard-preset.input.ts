import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { type ChartFilter } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateDashboardPresetInput {
  @Field(() => UUIDScalarType)
  dashboardId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => GraphQLJSON)
  filterState: ChartFilter;
}
