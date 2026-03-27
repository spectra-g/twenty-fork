import { useId } from 'react';

import {
  useDashboardFilters,
  type DashboardStageFilter,
} from '@/dashboards/hooks/useDashboardFilters';

export type DashboardStageFilterDefinition = {
  id: string;
  type: 'date' | 'owner' | 'stage';
  label: string;
  options: Array<{
    value: string;
    label: string;
  }>;
};

type DashboardFilterBarProps = {
  filterDefinitions: DashboardStageFilterDefinition[];
};

export const DashboardFilterBar = ({
  filterDefinitions,
}: DashboardFilterBarProps) => {
  const stageFilterDefinition = filterDefinitions.find(
    (filterDefinition) => filterDefinition.type === 'stage',
  );
  const { activeStageFilter, clearActiveStageFilter, setActiveStageFilter } =
    useDashboardFilters();
  const stageFilterSelectId = useId();

  const handleStageFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedValue = event.target.value;

    if (selectedValue === '') {
      clearActiveStageFilter();

      return;
    }

    const selectedOption = stageFilterDefinition?.options.find(
      (option) => option.value === selectedValue,
    );

    if (!selectedOption) {
      return;
    }

    const stageFilter: DashboardStageFilter = {
      value: selectedOption.value,
      label: selectedOption.label,
    };

    setActiveStageFilter(stageFilter);
  };

  return (
    <div data-testid="dashboard-filter-bar">
      {stageFilterDefinition ? (
        <>
          <label htmlFor={stageFilterSelectId}>
            {stageFilterDefinition.label} filter
          </label>
          <select
            id={stageFilterSelectId}
            aria-label={`${stageFilterDefinition.label} filter`}
            value={activeStageFilter?.value ?? ''}
            onChange={handleStageFilterChange}
          >
            <option value="">Select {stageFilterDefinition.label}</option>
            {stageFilterDefinition.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </>
      ) : null}
      {activeStageFilter ? (
        <button type="button" onClick={clearActiveStageFilter}>
          {stageFilterDefinition?.label} {activeStageFilter.label}
        </button>
      ) : null}
    </div>
  );
};
