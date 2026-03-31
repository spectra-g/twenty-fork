import { usePageLayoutGlobalFilters } from '@/dashboard/hooks/usePageLayoutGlobalFilters';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  border-bottom: 1px solid #e6e8ec;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
`;

const StyledSelectRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const StyledSelectField = styled.label`
  display: flex;
  flex-direction: column;
  font-size: 12px;
  gap: 4px;
`;

const StyledPillRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StyledPill = styled.span`
  align-items: center;
  background: #eef3ff;
  border-radius: 999px;
  display: inline-flex;
  gap: 8px;
  padding: 4px 10px;
`;

const StyledTextButton = styled.button`
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 0;
`;

export const DashboardGlobalFilterBar = () => {
  const {
    availableFilters,
    activeFilters,
    setFilterValue,
    removeFilterValue,
    clearFilters,
  } = usePageLayoutGlobalFilters();

  return (
    <StyledContainer data-testid="dashboard-filter-bar">
      <StyledSelectRow>
        {availableFilters.map((filter) => {
          const activeFilter = activeFilters.find(
            (currentActiveFilter) => currentActiveFilter.field === filter.field,
          );

          return (
            <StyledSelectField key={filter.field}>
              <span>{filter.label}</span>
              <select
                data-testid={`dashboard-filter-select-${filter.field}`}
                value={activeFilter?.value ?? ''}
                onChange={(event) => {
                  if (event.target.value === '') {
                    removeFilterValue(filter.field);
                    return;
                  }

                  setFilterValue(filter.field, event.target.value);
                }}
              >
                <option value="">All {filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </StyledSelectField>
          );
        })}
      </StyledSelectRow>

      <StyledPillRow>
        {activeFilters.map((activeFilter) => (
          <StyledPill
            key={`${activeFilter.field}-${activeFilter.value}`}
            data-testid={`dashboard-filter-pill-${activeFilter.field}-${activeFilter.value}`}
          >
            <span>{`${activeFilter.label}: ${activeFilter.value}`}</span>
            <StyledTextButton
              aria-label={`Filter: ${activeFilter.label} equals ${activeFilter.value}, remove to clear`}
              data-testid={`dashboard-filter-pill-remove-${activeFilter.field}-${activeFilter.value}`}
              type="button"
              onClick={() => removeFilterValue(activeFilter.field)}
            >
              Remove
            </StyledTextButton>
          </StyledPill>
        ))}

        {activeFilters.length > 0 && (
          <StyledTextButton
            data-testid="dashboard-filter-clear-all"
            type="button"
            onClick={clearFilters}
          >
            Clear all
          </StyledTextButton>
        )}
      </StyledPillRow>

      {/* @clawdence-stub: STORY-100 - Integrate global filters into widget filter composition - apply AND semantics with local filters */}
      {/* @clawdence-stub: STORY-102 - Implement filter preset CRUD operations and selection UI */}
      {/* @clawdence-stub: STORY-103 - Sync filter state with URL query params for shareability */}
      {/* @clawdence-stub: STORY-106 - Implement coordinated widget refresh to avoid independent refetch storms */}
      <div data-testid="dashboard-global-filter-update-indicator">
        {activeFilters.length > 0 ? 'Filters updated' : 'No filters applied'}
      </div>
    </StyledContainer>
  );
};
