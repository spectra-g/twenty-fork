import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { ChartFilter } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';

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

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  dashboardFilter?: ChartFilter;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  globalFilter?: ChartFilter;
}
