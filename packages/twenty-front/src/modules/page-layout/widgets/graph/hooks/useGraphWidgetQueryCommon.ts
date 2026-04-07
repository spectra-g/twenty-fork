/* eslint-disable @nx/enforce-module-boundaries */
import { dashboardFiltersComponentState } from '@/page-layout/states/dashboardFiltersComponentState';
import { getGraphWidgetConfigurationWithDashboardFilters } from '@/page-layout/widgets/graph/utils/getGraphWidgetConfigurationWithDashboardFilters';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
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
  const dashboardFilters = useAtomComponentStateValue(
    dashboardFiltersComponentState,
  );
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
  const configurationWithDashboardFilters =
    getGraphWidgetConfigurationWithDashboardFilters(
      configuration,
      dashboardFilters,
    );

  const gqlOperationFilter = computeRecordGqlOperationFilter({
    fields: objectMetadataItem.fields,
    filterValueDependencies: {
      timeZone: userTimezone,
    },
    recordFilters:
      configurationWithDashboardFilters.filter?.recordFilters ?? [],
    recordFilterGroups:
      configurationWithDashboardFilters.filter?.recordFilterGroups ?? [],
  });

  return {
    objectMetadataItem,
    gqlOperationFilter,
    aggregateField,
  };
};
