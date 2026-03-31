import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

import { DashboardFilterDTO } from './dashboard-filter.dto';

@InputType()
export class CreateDashboardPresetInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  dashboardId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  visibility: string;

  @Field(() => DashboardFilterDTO)
  @ValidateNested()
  @Type(() => DashboardFilterDTO)
  filter: DashboardFilterDTO;
}
