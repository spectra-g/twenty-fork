import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class DashboardPresetDTO {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => GraphQLJSON, { nullable: true })
  filterState: Record<string, unknown> | null;
}
