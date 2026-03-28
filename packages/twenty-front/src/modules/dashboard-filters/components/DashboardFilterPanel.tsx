import styled from '@emotion/styled';

import { DateRangeFilter } from '@/dashboard-filters/components/DateRangeFilter';
import { OwnerFilter } from '@/dashboard-filters/components/OwnerFilter';
import { StageFilter } from '@/dashboard-filters/components/StageFilter';
import { useDashboardFilters } from '@/dashboard-filters/hooks/useDashboardFilters';

const StyledPanel = styled.section`
  display: flex;
  gap: 16px;
  align-items: flex-end;
  padding: 16px;
`;

export const DashboardFilterPanel = () => {
  const {
    draftFilters,
    setOwnerId,
    setStartDate,
    setEndDate,
    setStageId,
    applyFilters,
    clearFilters,
  } = useDashboardFilters();

  return (
    <StyledPanel aria-label="Dashboard filters">
      <OwnerFilter value={draftFilters.ownerId} onChange={setOwnerId} />
      <DateRangeFilter
        startDate={draftFilters.startDate}
        endDate={draftFilters.endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      <StageFilter value={draftFilters.stageId} onChange={setStageId} />
      <button type="button" onClick={applyFilters}>
        Apply
      </button>
      <button type="button" onClick={clearFilters}>
        Clear filters
      </button>
    </StyledPanel>
  );
};
