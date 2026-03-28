import { useDashboardFilters } from '@/dashboard-filters/hooks/useDashboardFilters';
import { buildDashboardFilterQuery } from '@/dashboard-filters/utils/buildDashboardFilterQuery';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
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

  const aggregateFieldId = configuration.aggregateFieldMetadataId;
  const { appliedFilters } = useDashboardFilters();

  const aggregateField = objectMetadataItem.readableFields.find(
    (field: { id: string }) => field.id === aggregateFieldId,
  );

  if (!isDefined(aggregateField)) {
    throw new Error('Aggregate field not found');
  }

  const { userTimezone } = useUserTimezone();

  const widgetGqlOperationFilter = computeRecordGqlOperationFilter({
    fields: objectMetadataItem.fields,
    filterValueDependencies: {
      timeZone: userTimezone,
    },
    recordFilters: configuration.filter?.recordFilters ?? [],
    recordFilterGroups: configuration.filter?.recordFilterGroups ?? [],
  });

  const dashboardFilter = buildDashboardFilterQuery({
    dashboardFilters: appliedFilters,
    fields: objectMetadataItem.fields,
  });

  const dashboardGqlOperationFilter = isDefined(dashboardFilter)
    ? computeRecordGqlOperationFilter({
        fields: objectMetadataItem.fields,
        filterValueDependencies: {
          timeZone: userTimezone,
        },
        recordFilters: dashboardFilter.recordFilters ?? [],
        recordFilterGroups: dashboardFilter.recordFilterGroups ?? [],
      })
    : undefined;

  return {
    objectMetadataItem,
    gqlOperationFilter: dashboardGqlOperationFilter ?? widgetGqlOperationFilter,
    aggregateField,
  };
};
