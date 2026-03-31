import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useDashboardWidgetFilters } from '@/page-layout/widgets/states/contexts/DashboardWidgetFiltersContext';
import { mergeWidgetFilters } from '@/page-layout/widgets/utils/mergeWidgetFilters';
import {
  computeRecordGqlOperationFilter,
  isDefined,
} from 'twenty-shared/utils';
import {
  type AggregateChartConfiguration,
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
  WidgetType,
} from '~/generated-metadata/graphql';

export const useGraphWidgetQueryCommon = ({
  objectMetadataItemId,
  widgetType = WidgetType.GRAPH,
  configuration,
}: {
  objectMetadataItemId: string;
  widgetType?: WidgetType;
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
  const dashboardFilters = useDashboardWidgetFilters();
  const mergedFilter = mergeWidgetFilters({
    widgetType,
    widgetFilter: configuration.filter,
    dashboardFilters,
  });

  const gqlOperationFilter = computeRecordGqlOperationFilter({
    fields: objectMetadataItem.fields,
    filterValueDependencies: {
      timeZone: userTimezone,
    },
    recordFilters: mergedFilter?.recordFilters ?? [],
    recordFilterGroups: mergedFilter?.recordFilterGroups ?? [],
  });

  return {
    objectMetadataItem,
    gqlOperationFilter,
    aggregateField,
  };
};
