import { type DashboardFilterField } from '@/dashboards/states/dashboardFiltersState';
import { filterUrlQueryParamsSchema } from '@/views/schemas/filterUrlQueryParamsSchema';
import qs from 'qs';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const dashboardFilterFields = ['ownerId', 'dateRange', 'stageId'] as const;

const isDashboardFilterField = (
  value: string,
): value is DashboardFilterField => {
  return dashboardFilterFields.includes(value as DashboardFilterField);
};

const hasDashboardFilterQueryParams = (searchParams: URLSearchParams) => {
  return Array.from(searchParams.keys()).some((key) =>
    key.startsWith('filter['),
  );
};

export const useDashboardFiltersFromQueryParams = () => {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const queryParamsValidation = filterUrlQueryParamsSchema.safeParse(
      qs.parse(searchParams.toString()),
    );

    if (
      !queryParamsValidation.success ||
      queryParamsValidation.data.filter === undefined
    ) {
      return {
        dashboardFiltersFromQueryParams: {},
        hasInvalidFilterQueryParams:
          hasDashboardFilterQueryParams(searchParams),
      };
    }

    const dashboardFiltersFromQueryParams = Object.entries(
      queryParamsValidation.data.filter,
    ).reduce<Partial<Record<DashboardFilterField, string>>>(
      (dashboardFilters, [fieldName, operandValues]) => {
        if (!isDashboardFilterField(fieldName) || operandValues === undefined) {
          return dashboardFilters;
        }

        const firstFilterValue = Object.values(operandValues).find(
          (value): value is string => typeof value === 'string',
        );

        if (firstFilterValue === undefined) {
          return dashboardFilters;
        }

        return {
          ...dashboardFilters,
          [fieldName]: firstFilterValue,
        };
      },
      {},
    );

    return {
      dashboardFiltersFromQueryParams,
      hasInvalidFilterQueryParams: false,
    };
  }, [searchParams]);
};
