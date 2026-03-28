import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DashboardGlobalRecordFilterInput {
  @Field(() => String)
  fieldMetadataId: string;

  @Field(() => String)
  operand: string;

  @Field(() => String, { nullable: true })
  value?: string | null;

  @Field(() => String, { nullable: true })
  type?: string;

  @Field(() => String, { nullable: true })
  recordFilterGroupId?: string | null;

  @Field(() => String, { nullable: true })
  subFieldName?: string | null;
}

@InputType()
export class DashboardGlobalRecordFilterGroupInput {
  @Field(() => String)
  id: string;

  @Field(() => String)
  logicalOperator: string;

  @Field(() => String, { nullable: true })
  parentRecordFilterGroupId?: string | null;
}

@InputType()
export class DashboardGlobalFilterInput {
  @Field(() => [DashboardGlobalRecordFilterInput], { nullable: true })
  recordFilters?: DashboardGlobalRecordFilterInput[];

  @Field(() => [DashboardGlobalRecordFilterGroupInput], { nullable: true })
  recordFilterGroups?: DashboardGlobalRecordFilterGroupInput[];
}
