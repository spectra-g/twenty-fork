import { Field, ObjectType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type DashboardFilterPayload } from 'src/modules/dashboard/services/dashboard-preset.service';

@ObjectType('DashboardFilterPreset')
export class DashboardFilterPresetType {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => GraphQLJSON)
  filter: DashboardFilterPayload;

  @Field(() => Boolean)
  isActive: boolean;
}
