/* eslint-disable @nx/enforce-module-boundaries */
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { SerializedRelation } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PageLayoutTabDTO } from 'src/engine/metadata-modules/page-layout-tab/dtos/page-layout-tab.dto';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

registerEnumType(PageLayoutType, { name: 'PageLayoutType' });

@ObjectType('PageLayout')
export class PageLayoutDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field({ nullable: false })
  name: string;

  @Field(() => PageLayoutType, {
    nullable: false,
    defaultValue: PageLayoutType.RECORD_PAGE,
  })
  type: PageLayoutType;

  @Field(() => UUIDScalarType, { nullable: true })
  objectMetadataId?: string | null;

  @Field(() => [PageLayoutTabDTO], { nullable: true })
  tabs?: PageLayoutTabDTO[] | null;

  @Field(() => UUIDScalarType, { nullable: true })
  defaultTabToFocusOnMobileAndSidePanelId?: SerializedRelation;

  // @clawdence-stub: STORY-105 - Add feature-flag or conditional logic for legacy dashboards without filter configuration
  @Field(() => GraphQLJSON, { nullable: true })
  recordFilters?: unknown[] | null;

  // @clawdence-stub: STORY-105 - Add feature-flag or conditional logic for legacy dashboards without filter configuration
  @Field(() => GraphQLJSON, { nullable: true })
  recordFilterGroups?: unknown[] | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
