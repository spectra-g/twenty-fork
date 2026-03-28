import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PieChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.dto';
import { DashboardGlobalFilterInput } from 'src/modules/dashboard/chart-data/dtos/inputs/dashboard-global-filter.input';

@InputType()
export class PieChartDataInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  objectMetadataId: string;

  @Field(() => GraphQLJSON)
  @ValidateNested()
  @Type(() => PieChartConfigurationDTO)
  @IsNotEmpty()
  configuration: PieChartConfigurationDTO;

  @Field(() => DashboardGlobalFilterInput, { nullable: true })
  @ValidateNested()
  @Type(() => DashboardGlobalFilterInput)
  dashboardGlobalFilters?: DashboardGlobalFilterInput;
}
