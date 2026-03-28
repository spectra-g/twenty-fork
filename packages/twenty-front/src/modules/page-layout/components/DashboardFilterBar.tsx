import { useDashboardFilters } from '@/page-layout/hooks/useDashboardFilters';
import styled from '@emotion/styled';
import { ChangeEvent, useState } from 'react';

const StyledContainer = styled.div`
  align-items: center;
  border-bottom: 1px solid #d8dee6;
  display: flex;
  gap: 8px;
  padding: 8px 12px;
`;

const StyledAddFilterButton = styled.button`
  background: #f5f7fa;
  border: 1px solid #c9d2dc;
  border-radius: 6px;
  color: #1d2a3a;
  cursor: pointer;
  font: inherit;
  padding: 6px 10px;
`;

const StyledFilterChip = styled.button`
  background: #e9f2ff;
  border: 1px solid #b8d1f1;
  border-radius: 999px;
  color: #1d2a3a;
  cursor: pointer;
  font: inherit;
  padding: 6px 10px;
`;

const StyledEditor = styled.div`
  align-items: end;
  display: flex;
  gap: 8px;
`;

const StyledField = styled.label`
  color: #44556b;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  gap: 4px;
`;

const StyledInput = styled.input`
  border: 1px solid #c9d2dc;
  border-radius: 6px;
  font: inherit;
  padding: 6px 10px;
`;

const StyledSelect = styled.select`
  border: 1px solid #c9d2dc;
  border-radius: 6px;
  font: inherit;
  padding: 6px 10px;
`;

export const DashboardFilterBar = () => {
  const { dashboardFilters, addDashboardFilter, updateDashboardFilter } =
    useDashboardFilters();
  const [editedFilterId, setEditedFilterId] = useState<string | null>(null);

  const handleAddFilter = () => {
    const nextFilter = addDashboardFilter();
    setEditedFilterId(nextFilter.id);
  };

  const editedFilter =
    dashboardFilters.find(
      (dashboardFilter) => dashboardFilter.id === editedFilterId,
    ) ?? null;

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (editedFilter === null) {
      return;
    }

    updateDashboardFilter(editedFilter.id, {
      value: event.target.value,
      displayValue: event.target.value,
    });
  };

  return (
    <StyledContainer data-testid="dashboard-filter-bar">
      <StyledAddFilterButton type="button" onClick={handleAddFilter}>
        Add filter
      </StyledAddFilterButton>
      {dashboardFilters.map((dashboardFilter) => (
        <StyledFilterChip
          key={dashboardFilter.id}
          type="button"
          onClick={() => setEditedFilterId(dashboardFilter.id)}
        >
          {`${dashboardFilter.label} contains ${dashboardFilter.displayValue}`}
        </StyledFilterChip>
      ))}
      {editedFilter !== null && (
        <StyledEditor>
          <StyledField>
            Field
            <StyledSelect
              aria-label="Field"
              value="name"
              onChange={() => undefined}
            >
              <option value="name">Name</option>
            </StyledSelect>
          </StyledField>
          <StyledField>
            Value
            <StyledInput
              aria-label="Value"
              value={editedFilter.value}
              onChange={handleValueChange}
            />
          </StyledField>
          <StyledAddFilterButton
            type="button"
            onClick={() => setEditedFilterId(null)}
          >
            Apply filter
          </StyledAddFilterButton>
        </StyledEditor>
      )}
    </StyledContainer>
  );
};
