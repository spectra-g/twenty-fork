import { type PageLayoutActiveFilter } from '@/page-layout/types/PageLayoutFilter';
import { atom } from 'jotai';

export const dashboardGlobalFiltersState = atom<PageLayoutActiveFilter[]>([]);
