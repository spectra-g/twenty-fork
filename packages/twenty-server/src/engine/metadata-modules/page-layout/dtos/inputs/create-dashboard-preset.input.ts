import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateDashboardPresetInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  pageLayoutId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  filterState?: Record<string, unknown>;
}
