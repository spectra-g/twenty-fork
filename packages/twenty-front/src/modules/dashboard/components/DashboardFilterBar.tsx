import { DashboardPresetDropdown } from '@/dashboard/components/DashboardPresetDropdown';
import { useDashboardFilters } from '@/dashboard/hooks/useDashboardFilters';
import { useDashboardPresets } from '@/dashboard/hooks/useDashboardPresets';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  padding: 8px;
`;

export const DashboardFilterBar = () => {
  const { globalFilters, setGlobalFilters } = useDashboardFilters();
  const { applyPreset, presets, savePreset } = useDashboardPresets();
  const currentGlobalFilter = globalFilters[0];

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
      <DashboardPresetDropdown
        onApplyPreset={applyPreset}
        onSavePreset={savePreset}
        presets={presets}
      />
      {globalFilters.length === 0 ? (
        <button
          data-testid="dashboard-filter-toggle"
          onClick={handleApplyFilter}
        >
          {t`Open only`}
        </button>
      ) : (
        <SortOrFilterChip
          labelKey={`${currentGlobalFilter?.label ?? 'Status'}: `}
          labelValue={currentGlobalFilter?.displayValue ?? ''}
          onRemove={handleRemoveFilter}
          testId="dashboard-global-filter"
          type="filter"
        />
      )}
    </StyledContainer>
  );
};
