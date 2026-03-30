import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { DashboardPresetDTO } from 'src/modules/dashboard/dtos/dashboard-preset.dto';

@ObjectType()
export class DashboardFiltersAndPresetsDTO {
  @Field(() => GraphQLJSON, { nullable: true })
  activeFilterState: Record<string, unknown> | null;

  @Field(() => [DashboardPresetDTO])
  presets: DashboardPresetDTO[];
}

@ObjectType()
export class SaveDashboardPresetResponseDTO {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => DashboardPresetDTO)
  preset: DashboardPresetDTO;
}

@ObjectType()
export class DeleteDashboardPresetResponseDTO {
  @Field(() => Boolean)
  success: boolean;
}
