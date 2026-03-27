import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class RenameDashboardPresetInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  presetId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  newName: string;
}
