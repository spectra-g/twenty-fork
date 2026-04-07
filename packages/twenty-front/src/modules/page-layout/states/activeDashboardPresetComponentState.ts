/* eslint-disable @nx/enforce-module-boundaries */
import { type ChartFilter } from 'twenty-shared/types';

import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export type ActiveDashboardPreset = {
  id: string;
  name: string;
  filterState: ChartFilter;
};

export const activeDashboardPresetComponentState =
  createAtomComponentState<ActiveDashboardPreset | null>({
    key: 'activeDashboardPresetComponentState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
