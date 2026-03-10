import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { type DashboardFilterPayload } from 'src/modules/dashboard/services/dashboard-preset.service';

@InputType()
export class CreateDashboardFilterPresetInput {
  @Field(() => String)
  @IsNotEmpty()
  name: string;

  @Field(() => GraphQLJSON)
  @IsNotEmpty()
  filter: DashboardFilterPayload;
}
