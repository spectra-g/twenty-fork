export type DashboardDateRangeFilterValue =
  | 'LAST_7_DAYS'
  | 'LAST_30_DAYS'
  | 'LAST_90_DAYS';

export type DashboardFilterState = {
  owner: string | null;
  dateRange: DashboardDateRangeFilterValue | null;
  stage: string | null;
};

export const DEFAULT_DASHBOARD_FILTER_STATE: DashboardFilterState = {
  owner: null,
  dateRange: null,
  stage: null,
};
