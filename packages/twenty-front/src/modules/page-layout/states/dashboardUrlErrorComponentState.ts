import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export type DashboardUrlError = {
  message: string;
};

export const dashboardUrlErrorComponentState =
  createAtomComponentState<DashboardUrlError | null>({
    key: 'dashboardUrlErrorComponentState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
