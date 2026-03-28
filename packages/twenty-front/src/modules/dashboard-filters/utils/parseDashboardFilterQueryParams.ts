import qs from 'qs';

import {
  EMPTY_DASHBOARD_FILTERS,
  type DashboardFilters,
} from '@/dashboard-filters/states/dashboardFilterState';
import { filterUrlQueryParamsSchema } from '@/views/schemas/filterUrlQueryParamsSchema';
import { type UrlRecursiveFilterGroup } from '@/views/types/UrlRecursiveFilterGroup';
import { type UrlSingleFilter } from '@/views/types/UrlSingleFilter';
import { ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const OWNER_FILTER_FIELD = 'owner.workspaceMemberId';
const DATE_FILTER_FIELDS = ['closeDate', 'createdAt'];
const STAGE_FILTER_FIELD = 'stage';

type WarningHandler = (message: string) => void;
type ParsedFilterValue =
  | string
  | string[]
  | {
      selectedRecordIds: string[];
      isCurrentWorkspaceMemberSelected?: boolean;
    };
type ParsedFilterQueryParams = Record<
  string,
  Partial<Record<ViewFilterOperand, ParsedFilterValue>>
>;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

const buildFieldName = ({
  field,
  subField,
}: {
  field: string;
  subField?: string;
}) => (isNonEmptyString(subField) ? `${field}.${subField}` : field);

const parseOwnerId = ({
  value,
  onWarning,
}: {
  value: string;
  onWarning: WarningHandler;
}) => {
  try {
    const parsedValue = JSON.parse(value);

    if (
      typeof parsedValue !== 'object' ||
      parsedValue === null ||
      parsedValue.isCurrentWorkspaceMemberSelected !== false ||
      !Array.isArray(parsedValue.selectedRecordIds) ||
      !isNonEmptyString(parsedValue.selectedRecordIds[0])
    ) {
      onWarning('Ignored malformed dashboard owner filter in URL.');

      return undefined;
    }

    return parsedValue.selectedRecordIds[0];
  } catch {
    onWarning('Ignored malformed dashboard owner filter in URL.');

    return undefined;
  }
};

const applyDashboardFilterFromUrl = ({
  fieldName,
  operand,
  value,
  dashboardFilters,
  onWarning,
}: {
  fieldName: string;
  operand: string;
  value: string;
  dashboardFilters: DashboardFilters;
  onWarning: WarningHandler;
}) => {
  if (fieldName === OWNER_FILTER_FIELD && operand === ViewFilterOperand.IS) {
    const ownerId = parseOwnerId({ value, onWarning });

    if (isDefined(ownerId)) {
      dashboardFilters.ownerId = ownerId;
    }

    return;
  }

  if (
    DATE_FILTER_FIELDS.includes(fieldName) &&
    operand === ViewFilterOperand.GREATER_THAN_OR_EQUAL
  ) {
    dashboardFilters.startDate = value;

    return;
  }

  if (
    DATE_FILTER_FIELDS.includes(fieldName) &&
    operand === ViewFilterOperand.LESS_THAN_OR_EQUAL
  ) {
    dashboardFilters.endDate = value;

    return;
  }

  if (fieldName === STAGE_FILTER_FIELD && operand === ViewFilterOperand.IS) {
    dashboardFilters.stageId = value;
  }
};

const applyFlatFilters = ({
  filterQueryParams,
  dashboardFilters,
  onWarning,
}: {
  filterQueryParams: ParsedFilterQueryParams;
  dashboardFilters: DashboardFilters;
  onWarning: WarningHandler;
}) => {
  for (const [fieldName, filterByOperand] of Object.entries(
    filterQueryParams,
  )) {
    for (const [operand, rawValue] of Object.entries(filterByOperand)) {
      if (!isNonEmptyString(rawValue)) {
        onWarning('Ignored malformed dashboard filter value in URL.');
        continue;
      }

      applyDashboardFilterFromUrl({
        fieldName,
        operand,
        value: rawValue,
        dashboardFilters,
        onWarning,
      });
    }
  }
};

const applyGroupedFilters = ({
  filterGroup,
  dashboardFilters,
  onWarning,
}: {
  filterGroup: UrlRecursiveFilterGroup;
  dashboardFilters: DashboardFilters;
  onWarning: WarningHandler;
}) => {
  const applySingleFilter = (filter: UrlSingleFilter) => {
    applyDashboardFilterFromUrl({
      fieldName: buildFieldName({
        field: filter.field,
        subField: filter.subField,
      }),
      operand: filter.op,
      value: filter.value,
      dashboardFilters,
      onWarning,
    });
  };

  filterGroup.filters?.forEach(applySingleFilter);
  filterGroup.groups?.forEach((group) =>
    applyGroupedFilters({
      filterGroup: group,
      dashboardFilters,
      onWarning,
    }),
  );
};

export const parseDashboardFilterQueryParams = ({
  searchParams,
  onWarning = console.warn,
}: {
  searchParams: URLSearchParams | string;
  onWarning?: WarningHandler;
}): DashboardFilters => {
  const normalizedSearchParams =
    typeof searchParams === 'string'
      ? searchParams.replace(/^\?/, '')
      : searchParams.toString();

  const queryParamsValidation = filterUrlQueryParamsSchema.safeParse(
    qs.parse(normalizedSearchParams),
  );

  if (!queryParamsValidation.success) {
    onWarning('Ignored malformed dashboard filter query params.');

    return { ...EMPTY_DASHBOARD_FILTERS };
  }

  const dashboardFilters = { ...EMPTY_DASHBOARD_FILTERS };

  if (isDefined(queryParamsValidation.data.filter)) {
    applyFlatFilters({
      filterQueryParams: queryParamsValidation.data
        .filter as ParsedFilterQueryParams,
      dashboardFilters,
      onWarning,
    });
  }

  if (isDefined(queryParamsValidation.data.filterGroup)) {
    applyGroupedFilters({
      filterGroup: queryParamsValidation.data.filterGroup,
      dashboardFilters,
      onWarning,
    });
  }

  return dashboardFilters;
};
