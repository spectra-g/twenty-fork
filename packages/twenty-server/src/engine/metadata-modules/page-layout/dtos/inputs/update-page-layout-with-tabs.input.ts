import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { UpdatePageLayoutTabWithWidgetsInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/update-page-layout-tab-with-widgets.input';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

@InputType()
export class UpdatePageLayoutWithTabsInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => PageLayoutType)
  @IsEnum(PageLayoutType)
  @IsNotEmpty()
  type: PageLayoutType;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  objectMetadataId: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  recordFilters?: unknown[] | null;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  recordFilterGroups?: unknown[] | null;

  @Field(() => [UpdatePageLayoutTabWithWidgetsInput])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdatePageLayoutTabWithWidgetsInput)
  tabs: UpdatePageLayoutTabWithWidgetsInput[];
}
