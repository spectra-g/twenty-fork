/* eslint-disable @nx/enforce-module-boundaries */
import {
  type PageLayoutActiveFilter,
  type PageLayoutFilter,
} from '@/page-layout/types/PageLayoutFilter';
import { FIND_ONE_PAGE_LAYOUT } from '@/dashboards/graphql/queries/findOnePageLayout';
import { dashboardGlobalFiltersState } from '@/dashboard/states/dashboardGlobalFiltersState';
import { useUpdatePageLayoutWithTabsAndWidgets } from '@/page-layout/hooks/useUpdatePageLayoutWithTabsAndWidgets';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { convertPageLayoutDraftToUpdateInput } from '@/page-layout/utils/convertPageLayoutDraftToUpdateInput';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client';
import { useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import {
  type CompositeFieldSubFieldName,
  type FilterableAndTSVectorFieldType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  isDefined,
  type RecordFilter,
  type RecordFilterGroup,
} from 'twenty-shared/utils';

type PageLayoutRecordFilter = {
  id?: string;
  fieldMetadataId: string;
  label: string;
  value: string;
  displayValue?: string | null;
  type?: FilterableAndTSVectorFieldType | null;
  operand?: ViewFilterOperand | null;
  recordFilterGroupId?: string | null;
  subFieldName?: string | null;
};

type GetPageLayoutResponse = {
  getPageLayout?: {
    id: string;
    name: string;
    type: string;
    objectMetadataId?: string | null;
    tabs?: unknown[] | null;
    recordFilters?: PageLayoutRecordFilter[] | null;
    recordFilterGroups?: RecordFilterGroup[] | null;
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
  const { updatePageLayoutWithTabsAndWidgets } =
    useUpdatePageLayoutWithTabsAndWidgets();

  const persistedPageLayout = useMemo(() => {
    if (!isDefined(data?.getPageLayout)) {
      return null;
    }

    return transformPageLayout(data.getPageLayout as never);
  }, [data?.getPageLayout]);

  const persistedRecordFilters = useMemo(
    () => data?.getPageLayout?.recordFilters ?? [],
    [data?.getPageLayout?.recordFilters],
  );
  const persistedRecordFilterGroups = useMemo(
    () => data?.getPageLayout?.recordFilterGroups ?? [],
    [data?.getPageLayout?.recordFilterGroups],
  );

  const availableFilters = useMemo(
    () => getAvailableFiltersFromRecordFilters(persistedRecordFilters),
    [persistedRecordFilters],
  );
  const chartDataFilter = useMemo(() => {
    const recordFilters: RecordFilter[] = activeFilters
      .map((activeFilter) =>
        persistedRecordFilters.find(
          (recordFilter) =>
            recordFilter.fieldMetadataId === activeFilter.field &&
            recordFilter.value === activeFilter.value,
        ),
      )
      .filter(isDefined)
      .map((recordFilter, index) => ({
        id:
          recordFilter.id ??
          `${recordFilter.fieldMetadataId}-${recordFilter.value}-${index}`,
        fieldMetadataId: recordFilter.fieldMetadataId,
        operand: recordFilter.operand ?? ViewFilterOperand.IS,
        value: recordFilter.value,
        type: recordFilter.type ?? 'TEXT',
        recordFilterGroupId: recordFilter.recordFilterGroupId ?? undefined,
        subFieldName: (recordFilter.subFieldName ?? undefined) as
          | CompositeFieldSubFieldName
          | undefined,
      }));
    const referencedGroupIds = new Set(
      recordFilters
        .map((recordFilter) => recordFilter.recordFilterGroupId)
        .filter(isDefined),
    );
    const recordFilterGroups = persistedRecordFilterGroups.filter((group) =>
      referencedGroupIds.has(group.id),
    );

    return {
      recordFilters,
      recordFilterGroups,
    };
  }, [activeFilters, persistedRecordFilterGroups, persistedRecordFilters]);

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

    // @clawdence-stub: STORY-104 - Filter out values user lacks permission to access before applying filters
    setActiveFilters((currentActiveFilters) => {
      const nextActiveFilters = [
        ...currentActiveFilters.filter(
          (activeFilter) => activeFilter.field !== field,
        ),
        nextActiveFilter,
      ];

      void persistActiveFilters(nextActiveFilters);

      return nextActiveFilters;
    });
  };

  const removeFilterValue = (field: string) => {
    setActiveFilters((currentActiveFilters) => {
      const nextActiveFilters = currentActiveFilters.filter(
        (activeFilter) => activeFilter.field !== field,
      );

      void persistActiveFilters(nextActiveFilters);

      return nextActiveFilters;
    });
  };

  const clearFilters = () => {
    void persistActiveFilters([]);
    setActiveFilters([]);
  };

  const persistActiveFilters = async (
    nextActiveFilters: PageLayoutActiveFilter[],
  ) => {
    if (!isDefined(currentPageLayoutId) || !isDefined(persistedPageLayout)) {
      return;
    }

    const persistedFiltersByKey = new Map(
      persistedRecordFilters.map((recordFilter) => [
        `${recordFilter.fieldMetadataId}:${recordFilter.value}`,
        recordFilter,
      ]),
    );
    const nextRecordFilters = nextActiveFilters
      .map(
        (activeFilter) =>
          persistedFiltersByKey.get(
            `${activeFilter.field}:${activeFilter.value}`,
          ) ?? null,
      )
      .filter(isDefined);
    const nextRecordFilterGroupIds = new Set(
      nextRecordFilters
        .map((recordFilter) => recordFilter.recordFilterGroupId)
        .filter(isDefined),
    );
    const nextRecordFilterGroups = persistedRecordFilterGroups.filter((group) =>
      nextRecordFilterGroupIds.has(group.id),
    );

    const updateInput =
      convertPageLayoutDraftToUpdateInput(persistedPageLayout);

    await updatePageLayoutWithTabsAndWidgets(currentPageLayoutId, {
      ...updateInput,
      recordFilters: nextRecordFilters,
      recordFilterGroups: nextRecordFilterGroups,
    });
  };

  return {
    availableFilters,
    activeFilters,
    setFilterValue,
    removeFilterValue,
    clearFilters,
    presets: [],
    chartDataFilter,
  };
};
