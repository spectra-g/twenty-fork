import { useDashboardFilterState } from '@/dashboard/hooks/useDashboardFilterState';
import { type DashboardDateRangeFilterValue } from '@/dashboard/types/DashboardFilter';
import styled from '@emotion/styled';
import { useState } from 'react';

const StyledContainer = styled.div`
  border-bottom: 1px solid #d9d9dd;
  padding: 12px;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledTitle = styled.h3`
  font-size: 14px;
  margin: 0;
`;

const StyledControls = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  margin-top: 12px;
`;

const StyledControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledSelect = styled.select`
  border: 1px solid #d9d9dd;
  border-radius: 4px;
  font-size: 12px;
  padding: 4px 6px;
`;

const parseNullableValue = (value: string): string | null =>
  value.length > 0 ? value : null;

export const DashboardFilterPanel = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { filters, setOwnerFilter, setDateRangeFilter, setStageFilter } =
    useDashboardFilterState();

  return (
    <StyledContainer data-testid="dashboard-filter-panel">
      <StyledHeader>
        <StyledTitle>Dashboard Filters</StyledTitle>
        <button
          type="button"
          data-testid="dashboard-filter-panel-toggle"
          onClick={() => setIsPanelOpen((isOpen) => !isOpen)}
        >
          {isPanelOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </StyledHeader>

      {isPanelOpen && (
        <StyledControls>
          <StyledControl>
            <label htmlFor="dashboard-filter-owner-select">Owner</label>
            <StyledSelect
              id="dashboard-filter-owner-select"
              data-testid="dashboard-filter-owner-select"
              value={filters.owner ?? ''}
              onChange={(event) =>
                setOwnerFilter(parseNullableValue(event.target.value))
              }
            >
              <option value="">Any owner</option>
              <option value="John">John</option>
              <option value="Alice">Alice</option>
            </StyledSelect>
          </StyledControl>

          <StyledControl>
            <label htmlFor="dashboard-filter-date-range-select">Date Range</label>
            <StyledSelect
              id="dashboard-filter-date-range-select"
              data-testid="dashboard-filter-date-range-select"
              value={filters.dateRange ?? ''}
              onChange={(event) =>
                setDateRangeFilter(
                  parseNullableValue(event.target.value) as DashboardDateRangeFilterValue | null,
                )
              }
            >
              <option value="">Any time</option>
              <option value="LAST_7_DAYS">Last 7 days</option>
              <option value="LAST_30_DAYS">Last 30 days</option>
              <option value="LAST_90_DAYS">Last 90 days</option>
            </StyledSelect>
          </StyledControl>

          <StyledControl>
            <label htmlFor="dashboard-filter-stage-select">Stage</label>
            <StyledSelect
              id="dashboard-filter-stage-select"
              data-testid="dashboard-filter-stage-select"
              value={filters.stage ?? ''}
              onChange={(event) =>
                setStageFilter(parseNullableValue(event.target.value))
              }
            >
              <option value="">Any stage</option>
              <option value="Open">Open</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </StyledSelect>
          </StyledControl>
        </StyledControls>
      )}
    </StyledContainer>
  );
};
