import { DashboardFilterPresetDropdown } from '@/dashboards/components/DashboardFilterPresetDropdown';
import { buildDashboardShareUrl } from '@/dashboards/utils/buildDashboardShareUrl';
import { useDashboardFilters } from '@/dashboards/hooks/useDashboardFilters';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { ViewFilterOperand } from 'twenty-shared/types';
import { LightButton } from 'twenty-ui/input';

const StyledContainer = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
`;

const StyledFilterChips = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const createDefaultFilter = (): RecordFilter => ({
  id: 'dashboard-status-filter',
  fieldMetadataId: 'status',
  value: 'won',
  displayValue: 'won',
  type: 'TEXT',
  operand: ViewFilterOperand.IS,
  label: 'status',
});

export const DashboardFilterBar = () => {
  const { recordFilters, recordFilterGroups, addFilter, removeFilter } =
    useDashboardFilters();
  const [latestShareUrl, setLatestShareUrl] = useState('');

  const currentUrl =
    typeof window === 'undefined' ? '' : window.location.href;

  const hasDefaultStatusFilter = useMemo(
    () => recordFilters.some((filter) => filter.id === 'dashboard-status-filter'),
    [recordFilters],
  );

  const handleAddDefaultFilter = () => {
    if (hasDefaultStatusFilter) {
      return;
    }

    addFilter(createDefaultFilter());
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const shareUrl = buildDashboardShareUrl({
      baseUrl: `${window.location.origin}${window.location.pathname}`,
      recordFilters,
      recordFilterGroups,
    });

    setLatestShareUrl(shareUrl);
    window.history.pushState({}, '', shareUrl);

    await navigator.clipboard?.writeText(shareUrl);
  };

  return (
    <StyledContainer data-testid="dashboard-filter-bar">
      <StyledFilterChips>
        <LightButton
          title={t`Add dashboard filter`}
          accent="tertiary"
          onClick={handleAddDefaultFilter}
          data-testid="dashboard-add-filter"
        >
          {t`Add filter`}
        </LightButton>

        {recordFilters.map((filter) => (
          <LightButton
            key={filter.id}
            title={t`Remove dashboard filter`}
            accent="secondary"
            onClick={() => removeFilter(filter.id)}
            data-testid="dashboard-active-filter-chip"
          >
            {`${filter.fieldMetadataId}: ${filter.value}`}
          </LightButton>
        ))}
      </StyledFilterChips>

      <StyledActions>
        <DashboardFilterPresetDropdown />
        <LightButton
          title={t`Share dashboard filters`}
          accent="secondary"
          onClick={handleShare}
          data-testid="dashboard-share-button"
        >
          {t`Share`}
        </LightButton>
      </StyledActions>

      <span data-testid="dashboard-live-url" style={{ display: 'none' }}>
        {currentUrl}
      </span>
      <span data-testid="dashboard-share-url" style={{ display: 'none' }}>
        {latestShareUrl}
      </span>
    </StyledContainer>
  );
};
