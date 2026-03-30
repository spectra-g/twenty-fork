import { useLingui } from '@lingui/react/macro';
import { DashboardUrlFiltersEffect } from '@/dashboards/components/DashboardUrlFiltersEffect';
import { useDashboardFilters } from '@/dashboards/hooks/useDashboardFilters';
import { useDashboardPresets } from '@/dashboards/hooks/useDashboardPresets';
import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';

type DashboardSelectOption = {
  label: string;
  value: string;
};

const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

type DashboardFilterBarProps = {
  dashboardId: string;
};

export const DashboardFilterBar = ({
  dashboardId,
}: DashboardFilterBarProps) => {
  const { t } = useLingui();
  const { loading } = useDashboardPresets();
  const { dashboardFilters, setDashboardFilter } =
    useDashboardFilters(dashboardId);

  const ownerOptions: DashboardSelectOption[] = [
    {
      label: t`Sales Team`,
      value: 'sales-team',
    },
  ];

  const dateRangeOptions: DashboardSelectOption[] = [
    {
      label: t`Last 7 days`,
      value: 'last-7-days',
    },
    {
      label: t`Last 30 days`,
      value: 'last-30-days',
    },
  ];

  const stageOptions: DashboardSelectOption[] = [
    {
      label: t`Qualified`,
      value: 'qualified',
    },
  ];

  return (
    <StyledContainer>
      <DashboardUrlFiltersEffect dashboardId={dashboardId} />
      <Select
        dropdownId={`dashboard-filter-owner-${dashboardId}`}
        label="Owner"
        options={ownerOptions}
        value={dashboardFilters.ownerId}
        disabled={loading}
        emptyOption={{
          label: 'Owner',
          value: null,
        }}
        onChange={(value) => setDashboardFilter('ownerId', value)}
      />
      <Select
        dropdownId={`dashboard-filter-date-range-${dashboardId}`}
        label="Date Range"
        options={dateRangeOptions}
        value={dashboardFilters.dateRange}
        disabled={loading}
        emptyOption={{
          label: 'Date Range',
          value: null,
        }}
        onChange={(value) => setDashboardFilter('dateRange', value)}
      />
      <Select
        dropdownId={`dashboard-filter-stage-${dashboardId}`}
        label="Stage"
        options={stageOptions}
        value={dashboardFilters.stageId}
        disabled={loading}
        emptyOption={{
          label: 'Stage',
          value: null,
        }}
        onChange={(value) => setDashboardFilter('stageId', value)}
      />
    </StyledContainer>
  );
};
