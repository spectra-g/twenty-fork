import { type ChartFilters } from '@/command-menu/pages/page-layout/types/ChartFilters';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayout as PageLayoutGenerated } from '~/generated-metadata/graphql';

export type PageLayout = Omit<PageLayoutGenerated, 'tabs'> & {
  globalFilterState?: ChartFilters;
  tabs: PageLayoutTab[];
};
