import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayout as PageLayoutGenerated } from '~/generated-metadata/graphql';

export type PageLayout = Omit<PageLayoutGenerated, 'tabs'> & {
  activePresetFilterState?: Record<string, unknown> | null;
  dashboardFilters?: Array<Record<string, unknown>> | null;
  tabs: PageLayoutTab[];
};
