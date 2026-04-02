import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateDashboardPresetInput {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;
}
