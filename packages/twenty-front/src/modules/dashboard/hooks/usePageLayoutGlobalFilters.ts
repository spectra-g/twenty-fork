import {
  type PageLayoutActiveFilter,
  type PageLayoutFilter,
} from '@/page-layout/types/PageLayoutFilter';
import { dashboardGlobalFiltersState } from '@/dashboard/states/dashboardGlobalFiltersState';
import { useAtom } from 'jotai';

const MOCK_PAGE_LAYOUT_FILTERS: PageLayoutFilter[] = [
  {
    field: 'status',
    label: 'Status',
    options: [
      { value: 'Active Deals', label: 'Active Deals' },
      { value: 'Closed Won', label: 'Closed Won' },
    ],
  },
  {
    field: 'owner',
    label: 'Owner',
    options: [
      { value: 'Assigned to me', label: 'Assigned to me' },
      { value: 'Unassigned', label: 'Unassigned' },
    ],
  },
];

export const usePageLayoutGlobalFilters = () => {
  // @clawdence-stub: STORY-099 - Implement real usePageLayoutGlobalFilters hook with GraphQL fetch to FindOnePageLayout with globalFilter fields
  const [activeFilters, setActiveFilters] = useAtom(dashboardGlobalFiltersState);

  const setFilterValue = (field: string, value: string) => {
    const matchingFilter = MOCK_PAGE_LAYOUT_FILTERS.find(
      (availableFilter) => availableFilter.field === field,
    );

    if (!matchingFilter) {
      return;
    }

    const nextActiveFilter: PageLayoutActiveFilter = {
      field,
      label: matchingFilter.label,
      value,
    };

    // @clawdence-stub: STORY-101 - Persist global filter state to backend via pageLayout mutations
    // @clawdence-stub: STORY-104 - Filter out values user lacks permission to access before applying filters
    setActiveFilters((currentActiveFilters) => [
      ...currentActiveFilters.filter((activeFilter) => activeFilter.field !== field),
      nextActiveFilter,
    ]);
  };

  const removeFilterValue = (field: string) => {
    // @clawdence-stub: STORY-101 - Persist global filter state to backend via pageLayout mutations
    setActiveFilters((currentActiveFilters) =>
      currentActiveFilters.filter((activeFilter) => activeFilter.field !== field),
    );
  };

  const clearFilters = () => {
    // @clawdence-stub: STORY-101 - Persist global filter state to backend via pageLayout mutations
    setActiveFilters([]);
  };

  return {
    availableFilters: MOCK_PAGE_LAYOUT_FILTERS,
    activeFilters,
    setFilterValue,
    removeFilterValue,
    clearFilters,
    presets: [],
  };
};
