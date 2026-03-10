import { Field, ObjectType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('DashboardFilterPreset')
export class DashboardFilterPresetDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  dashboardId: string;

  @Field(() => String)
  name: string;

  @Field(() => GraphQLJSON)
  filter: Record<string, unknown>;

  @Field(() => String)
  createdAt: string;

  @Field(() => String)
  updatedAt: string;
}
