import { useDashboardFilters } from '@/dashboard/hooks/useDashboardFilters';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const StyledGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StyledLabel = styled.span`
  color: inherit;
  font-size: 12px;
  font-weight: 500;
  min-width: 100%;
  opacity: 0.7;
`;

const StyledPill = styled.div<{ variant: 'default' | 'light' }>`
  align-items: center;
  background-color: ${({ variant }) =>
    variant === 'light' ? '#f3f4f6' : '#e8f0ff'};
  border: 1px solid
    ${({ variant }) => (variant === 'light' ? '#d1d5db' : '#bfd4ff')};
  border-radius: 4px;
  color: ${({ variant }) => (variant === 'light' ? '#4b5563' : '#2563eb')};
  display: inline-flex;
  font-size: 12px;
  font-weight: 500;
  gap: 4px;
  min-height: 24px;
  padding: 0 8px;
  white-space: nowrap;
`;

const FilterGroup = ({
  filters,
  label,
  testId,
  variant,
}: {
  filters: RecordFilter[];
  label: string;
  testId: string;
  variant: 'default' | 'light';
}) => {
  if (filters.length === 0) {
    return null;
  }

  return (
    <StyledGroup data-testid={testId}>
      <StyledLabel>{label}</StyledLabel>
      {filters.map((filter, index) => (
        <StyledPill
          key={filter.id}
          data-testid={`${testId.replace('-group', '')}-${index}`}
          data-variant={variant}
          variant={variant}
        >
          <span>{filter.label}:</span>
          <span aria-hidden="true"> </span>
          <span>{filter.displayValue}</span>
        </StyledPill>
      ))}
    </StyledGroup>
  );
};

export const GraphWidgetFilterPills = ({
  widget,
}: {
  widget: Pick<PageLayoutWidget, 'configuration'>;
}) => {
  const { globalFilters } = useDashboardFilters();

  const localFilters = widget.configuration?.filter?.recordFilters ?? [];

  if (globalFilters.length === 0 && localFilters.length === 0) {
    return null;
  }

  return (
    <StyledContainer>
      <FilterGroup
        filters={globalFilters}
        label="Global filters"
        testId="graph-widget-global-filter-group"
        variant="light"
      />
      <FilterGroup
        filters={localFilters}
        label="Widget filters"
        testId="graph-widget-local-filter-group"
        variant="default"
      />
    </StyledContainer>
  );
};
