import { useDashboardFilters } from '@/dashboard/hooks/useDashboardFilters';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import styled from '@emotion/styled';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  padding: 8px;
`;

export const DashboardFilterBar = () => {
  const { globalFilters, setGlobalFilters } = useDashboardFilters();

  const handleApplyFilter = () => {
    setGlobalFilters([
      {
        id: 'dashboard-global-filter-open',
        fieldMetadataId: 'dashboard-global-filter-field-id',
        value: 'OPEN',
        displayValue: 'Open',
        operand: RecordFilterOperand.IS,
        type: 'TEXT',
        label: 'Status',
      },
    ]);
  };

  const handleRemoveFilter = () => {
    setGlobalFilters([]);
  };

  return (
    <StyledContainer data-testid="dashboard-filter-bar">
      {globalFilters.length === 0 ? (
        <button data-testid="dashboard-filter-toggle" onClick={handleApplyFilter}>
          Open only
        </button>
      ) : (
        <SortOrFilterChip
          labelKey="Status: "
          labelValue="Open"
          onRemove={handleRemoveFilter}
          testId="dashboard-global-filter"
          type="filter"
        />
      )}
    </StyledContainer>
  );
};
