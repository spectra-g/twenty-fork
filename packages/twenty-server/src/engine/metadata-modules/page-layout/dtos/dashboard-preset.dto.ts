import { Field, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType('DashboardPreset')
export class DashboardPresetDTO {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => GraphQLJSON)
  filterState: Record<string, unknown>;
}
