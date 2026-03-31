import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

import { DashboardFilterDTO } from './dashboard-filter.dto';

@InputType()
export class UpdateDashboardFiltersInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  dashboardId: string;

  @Field(() => DashboardFilterDTO)
  @ValidateNested()
  @Type(() => DashboardFilterDTO)
  activeFilters: DashboardFilterDTO;
}
