import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('UpdateDashboardFiltersOutput')
export class UpdateDashboardFiltersOutput {
  @Field(() => Boolean)
  success: boolean;
}
