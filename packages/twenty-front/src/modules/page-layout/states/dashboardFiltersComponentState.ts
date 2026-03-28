import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const dashboardFiltersComponentState =
  createAtomComponentState<RecordFilter[]>({
    key: 'dashboardFiltersComponentState',
    defaultValue: [],
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
