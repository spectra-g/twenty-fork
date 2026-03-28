import { type DashboardFilters } from '@/dashboard-filters/states/dashboardFilterState';
import { ViewFilterOperand } from 'twenty-shared/types';

const OWNER_FILTER_FIELD = 'owner.workspaceMemberId';
const DATE_FILTER_FIELD = 'closeDate';
const STAGE_FILTER_FIELD = 'stage';

const buildOwnerFilterValue = (ownerId: string) =>
  JSON.stringify({
    isCurrentWorkspaceMemberSelected: false,
    selectedRecordIds: [ownerId],
  });

export const buildDashboardFilterUrlQueryParams = (
  dashboardFilters: DashboardFilters,
): URLSearchParams => {
  const params = new URLSearchParams();

  if (dashboardFilters.ownerId !== '') {
    params.set(
      `filter[${OWNER_FILTER_FIELD}][${ViewFilterOperand.IS}]`,
      buildOwnerFilterValue(dashboardFilters.ownerId),
    );
  }

  if (dashboardFilters.startDate !== '') {
    params.set(
      `filter[${DATE_FILTER_FIELD}][${ViewFilterOperand.GREATER_THAN_OR_EQUAL}]`,
      dashboardFilters.startDate,
    );
  }

  if (dashboardFilters.endDate !== '') {
    params.set(
      `filter[${DATE_FILTER_FIELD}][${ViewFilterOperand.LESS_THAN_OR_EQUAL}]`,
      dashboardFilters.endDate,
    );
  }

  if (dashboardFilters.stageId !== '') {
    params.set(
      `filter[${STAGE_FILTER_FIELD}][${ViewFilterOperand.IS}]`,
      dashboardFilters.stageId,
    );
  }

  return params;
};
