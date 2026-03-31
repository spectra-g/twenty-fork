/* eslint-disable @nx/enforce-module-boundaries */
import {
  type PageLayoutActiveFilter,
  type PageLayoutFilter,
} from '@/page-layout/types/PageLayoutFilter';
import { FIND_ONE_PAGE_LAYOUT } from '@/dashboards/graphql/queries/findOnePageLayout';
import { dashboardGlobalFiltersState } from '@/dashboard/states/dashboardGlobalFiltersState';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client';
import { useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type PageLayoutRecordFilter = {
  fieldMetadataId: string;
  label: string;
  value: string;
  displayValue?: string | null;
};

type GetPageLayoutResponse = {
  getPageLayout?: {
    recordFilters?: PageLayoutRecordFilter[] | null;
  } | null;
};

const getAvailableFiltersFromRecordFilters = (
  recordFilters: PageLayoutRecordFilter[],
): PageLayoutFilter[] => {
  const filterMap = new Map<string, PageLayoutFilter>();

  for (const recordFilter of recordFilters) {
    const existingFilter = filterMap.get(recordFilter.fieldMetadataId);
    const nextOption = {
      value: recordFilter.value,
      label: recordFilter.displayValue ?? recordFilter.value,
    };

    if (!isDefined(existingFilter)) {
      filterMap.set(recordFilter.fieldMetadataId, {
        field: recordFilter.fieldMetadataId,
        label: recordFilter.label,
        options: [nextOption],
      });

      continue;
    }

    const hasExistingOption = existingFilter.options.some(
      (option) => option.value === nextOption.value,
    );

    if (!hasExistingOption) {
      existingFilter.options.push(nextOption);
    }
  }

  return [...filterMap.values()];
};

const getActiveFiltersFromRecordFilters = (
  recordFilters: PageLayoutRecordFilter[],
): PageLayoutActiveFilter[] => {
  return recordFilters.map((recordFilter) => ({
    field: recordFilter.fieldMetadataId,
    label: recordFilter.label,
    value: recordFilter.value,
  }));
};

export const usePageLayoutGlobalFilters = () => {
  const currentPageLayoutId = useAtomStateValue(currentPageLayoutIdState);
  const [activeFilters, setActiveFilters] = useAtom(
    dashboardGlobalFiltersState,
  );
  const { data } = useQuery<GetPageLayoutResponse>(FIND_ONE_PAGE_LAYOUT, {
    variables: {
      id: currentPageLayoutId,
    },
    skip: !isDefined(currentPageLayoutId),
  });

  const persistedRecordFilters = useMemo(
    () => data?.getPageLayout?.recordFilters ?? [],
    [data?.getPageLayout?.recordFilters],
  );

  const availableFilters = useMemo(
    () => getAvailableFiltersFromRecordFilters(persistedRecordFilters),
    [persistedRecordFilters],
  );

  useEffect(() => {
    if (persistedRecordFilters.length === 0) {
      return;
    }

    setActiveFilters(getActiveFiltersFromRecordFilters(persistedRecordFilters));
  }, [persistedRecordFilters, setActiveFilters]);

  const setFilterValue = (field: string, value: string) => {
    const matchingFilter = availableFilters.find(
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
      ...currentActiveFilters.filter(
        (activeFilter) => activeFilter.field !== field,
      ),
      nextActiveFilter,
    ]);
  };

  const removeFilterValue = (field: string) => {
    // @clawdence-stub: STORY-101 - Persist global filter state to backend via pageLayout mutations
    setActiveFilters((currentActiveFilters) =>
      currentActiveFilters.filter(
        (activeFilter) => activeFilter.field !== field,
      ),
    );
  };

  const clearFilters = () => {
    // @clawdence-stub: STORY-101 - Persist global filter state to backend via pageLayout mutations
    setActiveFilters([]);
  };

  return {
    availableFilters,
    activeFilters,
    setFilterValue,
    removeFilterValue,
    clearFilters,
    presets: [],
  };
};
