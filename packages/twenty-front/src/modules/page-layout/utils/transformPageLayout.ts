import { type ChartFilters } from '@/command-menu/pages/page-layout/types/ChartFilters';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import {
  PageLayoutType,
  type PageLayout as PageLayoutGenerated,
} from '~/generated-metadata/graphql';

const EMPTY_GLOBAL_FILTER_STATE: ChartFilters = {
  recordFilters: [],
  recordFilterGroups: [],
};

export const transformPageLayout = (
  pageLayout: PageLayoutGenerated,
): PageLayout => {
  return {
    ...pageLayout,
    globalFilterState:
      pageLayout.type === PageLayoutType.DASHBOARD
        ? ((pageLayout as PageLayout & { globalFilterState?: ChartFilters })
            .globalFilterState ?? EMPTY_GLOBAL_FILTER_STATE)
        : (pageLayout as PageLayout).globalFilterState,
    tabs: (pageLayout.tabs ?? [])
      .toSorted((a, b) => a.position - b.position)
      .map((tab): PageLayoutTab => {
        return {
          ...tab,
          widgets: tab.widgets ?? [],
        };
      }),
  };
};
