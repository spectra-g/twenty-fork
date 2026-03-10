import { Field, ObjectType } from '@nestjs/graphql';

import { DashboardFilterPresetType } from 'src/modules/dashboard/graphql/types/dashboard-filter-preset.type';

@ObjectType('Dashboard')
export class DashboardType {
  @Field(() => [DashboardFilterPresetType])
  presets: DashboardFilterPresetType[];

  @Field(() => String, { nullable: true })
  defaultPresetId: string | null;
}
