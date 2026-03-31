import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

import { DashboardFilterDTO } from './dashboard-filter.dto';

@ObjectType('DashboardFilterPresetCreatedBy')
export class DashboardFilterPresetCreatedByDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  name: string;
}

@ObjectType('DashboardFilterPreset')
export class DashboardFilterPresetDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  visibility: string;

  @Field(() => Int)
  position: number;

  @Field(() => DashboardFilterPresetCreatedByDTO)
  createdBy: DashboardFilterPresetCreatedByDTO;

  @Field(() => DashboardFilterDTO)
  filter: DashboardFilterDTO;
}

@ObjectType('DashboardFilters')
export class DashboardFiltersOutput {
  @Field(() => DashboardFilterDTO)
  activeFilters: DashboardFilterDTO;

  @Field(() => [DashboardFilterPresetDTO])
  presets: DashboardFilterPresetDTO[];
}
