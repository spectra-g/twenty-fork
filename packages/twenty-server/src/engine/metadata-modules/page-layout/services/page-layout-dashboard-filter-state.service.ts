import { Injectable } from '@nestjs/common';

import { type PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';

type PageLayoutDashboardFilterState = {
  recordFilters: unknown[] | null;
  recordFilterGroups: unknown[] | null;
};

@Injectable()
export class PageLayoutDashboardFilterStateService {
  private readonly filterStateByPageLayoutId = new Map<
    string,
    PageLayoutDashboardFilterState
  >();

  getPageLayoutWithDashboardFilterState(
    pageLayout: PageLayoutDTO,
  ): PageLayoutDTO {
    const dashboardFilterState = this.filterStateByPageLayoutId.get(
      pageLayout.id,
    );

    return {
      ...pageLayout,
      recordFilters: dashboardFilterState?.recordFilters ?? null,
      recordFilterGroups: dashboardFilterState?.recordFilterGroups ?? null,
    };
  }

  saveDashboardFilterStateForPageLayout({
    pageLayoutId,
    recordFilters,
    recordFilterGroups,
  }: {
    pageLayoutId: string;
    recordFilters?: unknown[] | null;
    recordFilterGroups?: unknown[] | null;
  }) {
    // @clawdence-stub: STORY-101 - Implement actual persistence of recordFilters and recordFilterGroups to page layout metadata storage
    this.filterStateByPageLayoutId.set(pageLayoutId, {
      recordFilters: recordFilters ?? null,
      recordFilterGroups: recordFilterGroups ?? null,
    });
  }
}
