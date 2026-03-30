import { useDashboardFilters } from '@/dashboards/hooks/useDashboardFilters';
import { useDashboardPresets } from '@/dashboards/hooks/useDashboardPresets';
import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { type SelectOption } from 'twenty-ui/input';

const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const OWNER_OPTIONS: SelectOption<string>[] = [
  {
    label: 'Sales Team',
    value: 'sales-team',
  },
];

const DATE_RANGE_OPTIONS: SelectOption<string>[] = [
  {
    label: 'Last 7 days',
    value: 'last-7-days',
  },
  {
    label: 'Last 30 days',
    value: 'last-30-days',
  },
];

const STAGE_OPTIONS: SelectOption<string>[] = [
  {
    label: 'Qualified',
    value: 'qualified',
  },
];

type DashboardFilterBarProps = {
  dashboardId: string;
};

export const DashboardFilterBar = ({
  dashboardId,
}: DashboardFilterBarProps) => {
  const { loading } = useDashboardPresets();
  const { dashboardFilters, setDashboardFilter } =
    useDashboardFilters(dashboardId);

  return (
    <StyledContainer>
      <Select
        dropdownId={`dashboard-filter-owner-${dashboardId}`}
        label="Owner"
        options={OWNER_OPTIONS}
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
        options={DATE_RANGE_OPTIONS}
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
        options={STAGE_OPTIONS}
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
