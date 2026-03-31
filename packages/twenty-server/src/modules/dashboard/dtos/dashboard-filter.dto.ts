import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('DashboardRecordFilter')
@InputType('DashboardRecordFilterInput')
export class DashboardRecordFilterDTO {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  fieldMetadataId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  operand: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  value?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  type?: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  recordFilterGroupId?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  subFieldName?: string | null;
}

@ObjectType('DashboardRecordFilterGroup')
@InputType('DashboardRecordFilterGroupInput')
export class DashboardRecordFilterGroupDTO {
  @Field(() => UUIDScalarType)
  @IsUUID()
  id: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  logicalOperator: string;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentRecordFilterGroupId?: string | null;
}

@ObjectType('DashboardFilter')
@InputType('DashboardFilterInput')
export class DashboardFilterDTO {
  @Field(() => [DashboardRecordFilterDTO])
  @ValidateNested({ each: true })
  @Type(() => DashboardRecordFilterDTO)
  recordFilters: DashboardRecordFilterDTO[];

  @Field(() => [DashboardRecordFilterGroupDTO])
  @ValidateNested({ each: true })
  @Type(() => DashboardRecordFilterGroupDTO)
  recordFilterGroups: DashboardRecordFilterGroupDTO[];
}
