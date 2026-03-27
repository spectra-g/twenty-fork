import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class DashboardFilterInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  fieldMetadataId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  operand: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  value?: string | number | boolean | null | Record<string, unknown>;
}
