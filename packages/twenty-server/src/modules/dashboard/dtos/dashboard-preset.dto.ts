/* eslint-disable @nx/enforce-module-boundaries */
import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type ChartFilter } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('DashboardPreset')
export class DashboardPresetDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => UUIDScalarType)
  dashboardId: string;

  @Field(() => GraphQLJSON)
  filter: ChartFilter;

  @Field(() => String)
  createdAt: string;

  @Field(() => String)
  updatedAt: string;
}
