import gql from 'graphql-tag';
import {
  createTestDashboardWithGraphQL,
  destroyDashboardWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';
import { findOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/find-one-page-layout.util';
import { findPageLayoutTabs } from 'test/integration/metadata/suites/page-layout-tab/utils/find-page-layout-tabs.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { isNonEmptyString } from '@sniptt/guards';

const PAGE_LAYOUT_FILTER_GQL_FIELDS = `
  id
  recordFilters
  recordFilterGroups
`;

const recordFilters = [
  {
    id: 'record-filter-1',
    fieldMetadataId: 'status',
    label: 'Status',
    value: 'active',
    displayValue: 'Active',
    type: 'SELECT',
    operand: 'is',
  },
];

const recordFilterGroups = [
  {
    id: 'record-filter-group-1',
    logicalOperator: 'AND',
    parentRecordFilterGroupId: null,
  },
];

describe('Page layout filter API', () => {
  let dashboardId = '';
  let pageLayoutId = '';

  beforeEach(async () => {
    const dashboard = await createTestDashboardWithGraphQL({
      title: 'Dashboard with filters',
    });

    dashboardId = dashboard.id;
    pageLayoutId = dashboard.pageLayoutId ?? '';
  });

  afterEach(async () => {
    if (isNonEmptyString(dashboardId)) {
      await destroyDashboardWithGraphQL(dashboardId);
    }
  });

  it('returns nullable filter fields for legacy dashboards and echoes updated dashboard filters in query and mutation responses', async () => {
    const legacyPageLayoutResponse = await findOnePageLayout({
      expectToFail: false,
      gqlFields: PAGE_LAYOUT_FILTER_GQL_FIELDS,
      input: { id: pageLayoutId },
    });

    expect(legacyPageLayoutResponse.data.getPageLayout).toMatchObject({
      id: pageLayoutId,
      recordFilters: null,
      recordFilterGroups: null,
    });

    const pageLayoutTabsResponse = await findPageLayoutTabs({
      expectToFail: false,
      input: { pageLayoutId },
    });

    const updatedPageLayoutResponse = await makeMetadataAPIRequest({
      query: gql`
        mutation UpdatePageLayoutWithTabsAndWidgets(
          $id: String!
          $input: UpdatePageLayoutWithTabsInput!
        ) {
          updatePageLayoutWithTabsAndWidgets(id: $id, input: $input) {
            ${PAGE_LAYOUT_FILTER_GQL_FIELDS}
          }
        }
      `,
      variables: {
        id: pageLayoutId,
        input: {
          name: 'Dashboard with filters',
          type: 'DASHBOARD',
          objectMetadataId: null,
          recordFilters,
          recordFilterGroups,
          tabs: pageLayoutTabsResponse.data.getPageLayoutTabs.map((tab) => ({
            id: tab.id,
            title: tab.title,
            position: tab.position,
            widgets: [],
          })),
        },
      },
    });

    expect(updatedPageLayoutResponse.body.errors).toBeUndefined();
    expect(
      updatedPageLayoutResponse.body.data.updatePageLayoutWithTabsAndWidgets,
    ).toMatchObject({
      id: pageLayoutId,
      recordFilters,
      recordFilterGroups,
    });

    const persistedPageLayoutResponse = await findOnePageLayout({
      expectToFail: false,
      gqlFields: PAGE_LAYOUT_FILTER_GQL_FIELDS,
      input: { id: pageLayoutId },
    });

    expect(persistedPageLayoutResponse.data.getPageLayout).toMatchObject({
      id: pageLayoutId,
      recordFilters,
      recordFilterGroups,
    });
  });
});
