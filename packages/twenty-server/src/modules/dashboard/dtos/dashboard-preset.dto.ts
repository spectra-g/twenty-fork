import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import GraphQLJSON from 'graphql-type-json';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { type ChartFilter } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('DashboardPreset')
export class DashboardPresetDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  dashboardId: string;

  @Field(() => String)
  name: string;

  @Field(() => GraphQLJSON)
  filterState: ChartFilter;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
