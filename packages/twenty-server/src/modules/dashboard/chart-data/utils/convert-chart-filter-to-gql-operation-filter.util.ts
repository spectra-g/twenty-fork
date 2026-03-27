/* eslint-disable @nx/enforce-module-boundaries */
import { type ChartFilter } from 'twenty-shared/types';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type DashboardFilterVariable } from 'src/modules/dashboard/chart-data/types/dashboard-filter-variable.type';
import { mergeChartFiltersWithDashboardFilters } from 'src/modules/dashboard/chart-data/utils/merge-chart-filters-with-dashboard-filters.util';

type ConvertChartFilterToGqlOperationFilterParams = {
  filter: ChartFilter | undefined;
  dashboardFilters?: DashboardFilterVariable[];
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  userTimezone: string;
};

export const convertChartFilterToGqlOperationFilter = ({
  filter,
  dashboardFilters,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  userTimezone,
}: ConvertChartFilterToGqlOperationFilterParams): ObjectRecordFilter => {
  return mergeChartFiltersWithDashboardFilters({
    filter,
    dashboardFilters,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    userTimezone,
  });
};
