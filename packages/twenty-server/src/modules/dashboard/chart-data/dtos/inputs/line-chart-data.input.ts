import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { DashboardFilterVariableInput } from 'src/modules/dashboard/chart-data/dtos/inputs/dashboard-filter-variable.input';

@InputType()
export class LineChartDataInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  objectMetadataId: string;

  @Field(() => GraphQLJSON)
  @ValidateNested()
  @Type(() => LineChartConfigurationDTO)
  @IsNotEmpty()
  configuration: LineChartConfigurationDTO;

  @Field(() => [DashboardFilterVariableInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DashboardFilterVariableInput)
  @IsOptional()
  dashboardFilters?: DashboardFilterVariableInput[];
}
