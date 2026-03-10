import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateDashboardFilterPresetInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  dashboardId: string;

  @Field(() => String)
  @IsNotEmpty()
  name: string;

  @Field(() => GraphQLJSON)
  @IsObject()
  @IsNotEmpty()
  filter: Record<string, unknown>;
}
