import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { type ChartFilter } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ApplyDashboardPresetResult')
export class ApplyDashboardPresetResultDTO {
  @Field(() => UUIDScalarType)
  dashboardId: string;

  @Field(() => GraphQLJSON)
  filterConfiguration: ChartFilter;
}
