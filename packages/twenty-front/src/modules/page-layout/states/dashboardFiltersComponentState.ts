import { type ChartFilter } from 'twenty-shared/types';

import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const dashboardFiltersComponentState =
  createAtomComponentState<ChartFilter>({
    key: 'dashboardFiltersComponentState',
    defaultValue: {
      recordFilters: [],
      recordFilterGroups: [],
    },
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
