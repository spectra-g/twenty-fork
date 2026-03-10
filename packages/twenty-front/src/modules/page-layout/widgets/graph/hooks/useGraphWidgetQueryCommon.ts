import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useDashboardFilters } from '@/dashboards/hooks/useDashboardFilters';
import { mergeDashboardAndWidgetChartFilters } from '@/dashboards/utils/mergeDashboardAndWidgetChartFilters';
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

  const aggregateField = objectMetadataItem.readableFields.find(
    (field: { id: string }) => field.id === aggregateFieldId,
  );

  if (!isDefined(aggregateField)) {
    throw new Error('Aggregate field not found');
  }

  const { userTimezone } = useUserTimezone();
  const {
    recordFilters: dashboardRecordFilters,
    recordFilterGroups: dashboardRecordFilterGroups,
  } = useDashboardFilters();

  const mergedFilterConfig = mergeDashboardAndWidgetChartFilters({
    dashboardRecordFilters,
    dashboardRecordFilterGroups,
    widgetRecordFilters: configuration.filter?.recordFilters ?? [],
    widgetRecordFilterGroups: configuration.filter?.recordFilterGroups ?? [],
  });

  const gqlOperationFilter = computeRecordGqlOperationFilter({
    fields: objectMetadataItem.fields,
    filterValueDependencies: {
      timeZone: userTimezone,
    },
    recordFilters: mergedFilterConfig.recordFilters,
    recordFilterGroups: mergedFilterConfig.recordFilterGroups,
  });

  return {
    objectMetadataItem,
    gqlOperationFilter,
    aggregateField,
  };
};
