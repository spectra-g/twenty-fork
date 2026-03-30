import { type DashboardFilterField } from '@/dashboards/states/dashboardFiltersState';
import { filterUrlQueryParamsSchema } from '@/views/schemas/filterUrlQueryParamsSchema';
import qs from 'qs';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

const dashboardFilterFields = ['ownerId', 'dateRange', 'stageId'] as const;

const isDashboardFilterField = (
  value: string,
): value is DashboardFilterField => {
  return dashboardFilterFields.includes(value as DashboardFilterField);
};

export const useDashboardFiltersFromQueryParams = () => {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const queryParamsValidation = filterUrlQueryParamsSchema.safeParse(
      qs.parse(searchParams.toString()),
    );

    if (!queryParamsValidation.success || !isDefined(queryParamsValidation.data.filter)) {
      return {};
    }

    return Object.entries(queryParamsValidation.data.filter).reduce<
      Partial<Record<DashboardFilterField, string>>
    >((dashboardFilters, [fieldName, operandValues]) => {
      if (!isDashboardFilterField(fieldName) || !isDefined(operandValues)) {
        return dashboardFilters;
      }

      const firstFilterValue = Object.values(operandValues).find(
        (value): value is string => typeof value === 'string',
      );

      if (!isDefined(firstFilterValue)) {
        return dashboardFilters;
      }

      return {
        ...dashboardFilters,
        [fieldName]: firstFilterValue,
      };
    }, {});
  }, [searchParams]);
};
