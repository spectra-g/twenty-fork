import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useDashboardFilters } from '@/page-layout/hooks/useDashboardFilters';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  computeRecordGqlOperationFilter,
  isDefined,
} from 'twenty-shared/utils';
import {
  type AggregateChartConfiguration,
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
} from '~/generated-metadata/graphql';

import { composeChartFilters } from './composeChartFilters';

export const useGraphWidgetQueryCommon = ({
  objectMetadataItemId,
  configuration,
}: {
  objectMetadataItemId: string;
  configuration:
    | BarChartConfiguration
    | AggregateChartConfiguration
    | LineChartConfiguration
    | PieChartConfiguration;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });
  const { dashboardFilters } = useDashboardFilters();

  const aggregateFieldId = configuration.aggregateFieldMetadataId;

  const aggregateField = objectMetadataItem.readableFields.find(
    (field: { id: string }) => field.id === aggregateFieldId,
  );

  if (!isDefined(aggregateField)) {
    throw new Error('Aggregate field not found');
  }

  const { userTimezone } = useUserTimezone();

  const activeDashboardFilters = dashboardFilters.filter(
    (dashboardFilter) => dashboardFilter.value.trim().length > 0,
  );

  const composedFilters = composeChartFilters({
    dashboardGlobalFilters: activeDashboardFilters,
    localFilters: configuration.filter,
  });

  const gqlOperationFilter = computeRecordGqlOperationFilter({
    fields: objectMetadataItem.fields,
    filterValueDependencies: {
      timeZone: userTimezone,
    },
    recordFilters: composedFilters.recordFilters,
    recordFilterGroups: composedFilters.recordFilterGroups,
  });

  return {
    objectMetadataItem,
    gqlOperationFilter,
    aggregateField,
  };
};
