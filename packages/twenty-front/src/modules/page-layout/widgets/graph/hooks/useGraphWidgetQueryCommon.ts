import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useEffectiveFilters } from '@/page-layout/hooks/useEffectiveFilters';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
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
  const { dashboardFilterState } = useLayoutRenderingContext();

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

  const effectiveFilters = useEffectiveFilters({
    localFilters: configuration.filter,
    dashboardFilterState,
  });

  const gqlOperationFilter = computeRecordGqlOperationFilter({
    fields: objectMetadataItem.fields,
    filterValueDependencies: {
      timeZone: userTimezone,
    },
    recordFilters: effectiveFilters.recordFilters ?? [],
    recordFilterGroups: effectiveFilters.recordFilterGroups ?? [],
  });

  return {
    objectMetadataItem,
    gqlOperationFilter,
    aggregateField,
  };
};
