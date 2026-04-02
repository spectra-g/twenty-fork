import {
  createTestDashboardWithGraphQL,
  destroyDashboardWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { findOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/find-one-page-layout.util';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

describe('Page layout filter support query', () => {
  let pageLayoutIdsToDestroy: string[] = [];
  let dashboardIdsToDestroy: string[] = [];

  afterEach(async () => {
    for (const dashboardId of dashboardIdsToDestroy) {
      await destroyDashboardWithGraphQL(dashboardId);
    }

    for (const pageLayoutId of pageLayoutIdsToDestroy) {
      await destroyOnePageLayout({
        expectToFail: false,
        input: { id: pageLayoutId },
      });
    }

    pageLayoutIdsToDestroy = [];
    dashboardIdsToDestroy = [];
  });

  it('returns filterSupport true for a dashboard page layout linked to a persisted dashboard', async () => {
    const { data: pageLayoutData } = await createOnePageLayout({
      expectToFail: false,
      input: {
        name: 'Dashboard Page Layout',
        type: PageLayoutType.DASHBOARD,
      },
    });

    const pageLayoutId = pageLayoutData.createPageLayout.id;

    pageLayoutIdsToDestroy.push(pageLayoutId);

    const dashboard = await createTestDashboardWithGraphQL({
      title: 'Revenue Dashboard',
      pageLayoutId,
    });

    dashboardIdsToDestroy.push(dashboard.id);

    const { data } = await findOnePageLayout({
      expectToFail: false,
      gqlFields: `
        id
        type
        filterSupport
      `,
      input: { id: pageLayoutId },
    });

    expect(data.getPageLayout).toMatchObject({
      id: pageLayoutId,
      type: PageLayoutType.DASHBOARD,
      filterSupport: true,
    });
  });

  it('returns filterSupport false when the page layout is not linked to a persisted dashboard', async () => {
    const { data: pageLayoutData } = await createOnePageLayout({
      expectToFail: false,
      input: {
        name: 'Standalone Dashboard Layout',
        type: PageLayoutType.DASHBOARD,
      },
    });

    const pageLayoutId = pageLayoutData.createPageLayout.id;

    pageLayoutIdsToDestroy.push(pageLayoutId);

    const { data } = await findOnePageLayout({
      expectToFail: false,
      gqlFields: `
        id
        type
        filterSupport
      `,
      input: { id: pageLayoutId },
    });

    expect(data.getPageLayout).toMatchObject({
      id: pageLayoutId,
      type: PageLayoutType.DASHBOARD,
      filterSupport: false,
    });
  });
});
