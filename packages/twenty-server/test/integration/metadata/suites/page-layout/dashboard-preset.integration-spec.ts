// Acceptance: requires live stack at the consumer-facing GraphQL boundary — enable in CI or local dev with full environment running.
import gql from 'graphql-tag';
import {
  createTestDashboardWithGraphQL,
  destroyDashboardWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

describe.skip('Dashboard preset GraphQL acceptance', () => {
  let pageLayoutId = '';
  let dashboardId = '';

  beforeEach(async () => {
    const { data } = await createOnePageLayout({
      expectToFail: false,
      input: {
        name: 'Pipeline Dashboard Layout',
        type: PageLayoutType.DASHBOARD,
      },
    });

    pageLayoutId = data.createPageLayout.id;

    const dashboard = await createTestDashboardWithGraphQL({
      title: 'Pipeline Dashboard',
      pageLayoutId,
    });

    dashboardId = dashboard.id;
  });

  afterEach(async () => {
    if (dashboardId) {
      await destroyDashboardWithGraphQL(dashboardId);
      dashboardId = '';
    }

    if (pageLayoutId) {
      await destroyOnePageLayout({
        expectToFail: false,
        input: { id: pageLayoutId },
      });
      pageLayoutId = '';
    }
  });

  it('should create a dashboard preset and reload it by identifier', async () => {
    const createResponse = await makeMetadataAPIRequest({
      query: gql`
        mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
          createDashboardPreset(input: $input) {
            id
            name
            filterState
          }
        }
      `,
      variables: {
        input: {
          pageLayoutId,
          name: 'Sales View',
          filterState: {
            stage: {
              eq: 'OPEN',
            },
          },
        },
      },
    });

    expect(createResponse.body.errors).toBeUndefined();
    expect(createResponse.body.data?.createDashboardPreset.id).toEqual(
      expect.any(String),
    );
    expect(createResponse.body.data?.createDashboardPreset.name).toBe(
      'Sales View',
    );
    expect(createResponse.body.data?.createDashboardPreset.filterState).toEqual(
      {
        stage: {
          eq: 'OPEN',
        },
      },
    );

    const layoutResponse = await makeMetadataAPIRequest({
      query: gql`
        query GetDashboardLayoutByUrl($dashboardId: UUID!, $presetId: String) {
          getDashboardLayoutByUrl(
            dashboardId: $dashboardId
            presetId: $presetId
          ) {
            id
            name
            type
            activePresetFilterState
          }
        }
      `,
      variables: {
        dashboardId,
        presetId: createResponse.body.data?.createDashboardPreset.id,
      },
    });

    expect(layoutResponse.body.errors).toBeUndefined();
    expect(layoutResponse.body.data?.getDashboardLayoutByUrl.id).toBe(
      pageLayoutId,
    );
    expect(
      layoutResponse.body.data?.getDashboardLayoutByUrl.activePresetFilterState,
    ).toEqual({
      stage: {
        eq: 'OPEN',
      },
    });
  });

  it('should rename a dashboard preset and surface the new name on subsequent reads', async () => {
    const createResponse = await makeMetadataAPIRequest({
      query: gql`
        mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
          createDashboardPreset(input: $input) {
            id
            name
            filterState
          }
        }
      `,
      variables: {
        input: {
          pageLayoutId,
          name: 'Sales View',
          filterState: {
            owner: {
              eq: 'apple-jane',
            },
          },
        },
      },
    });

    expect(createResponse.body.errors).toBeUndefined();

    const response = await makeMetadataAPIRequest({
      query: gql`
        mutation RenameDashboardPreset($input: RenameDashboardPresetInput!) {
          renameDashboardPreset(input: $input) {
            id
            name
            filterState
          }
        }
      `,
      variables: {
        input: {
          presetId: createResponse.body.data?.createDashboardPreset.id,
          newName: 'Q1 Sales',
        },
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data?.renameDashboardPreset.id).toBe(
      createResponse.body.data?.createDashboardPreset.id,
    );
    expect(response.body.data?.renameDashboardPreset.name).toBe('Q1 Sales');
    expect(response.body.data?.renameDashboardPreset.filterState).toEqual({
      owner: {
        eq: 'apple-jane',
      },
    });
  });

  it('should resolve a dashboard layout by URL and apply the active preset filter state', async () => {
    const createResponse = await makeMetadataAPIRequest({
      query: gql`
        mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
          createDashboardPreset(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          pageLayoutId,
          name: 'Pipeline',
          filterState: {
            probability: {
              gte: 70,
            },
          },
        },
      },
    });

    expect(createResponse.body.errors).toBeUndefined();

    const response = await makeMetadataAPIRequest({
      query: gql`
        query GetDashboardLayoutByUrl($dashboardId: UUID!, $presetId: String) {
          getDashboardLayoutByUrl(
            dashboardId: $dashboardId
            presetId: $presetId
          ) {
            id
            name
            type
            activePresetFilterState
          }
        }
      `,
      variables: {
        dashboardId,
        presetId: createResponse.body.data?.createDashboardPreset.id,
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data?.getDashboardLayoutByUrl.id).toBe(pageLayoutId);
    expect(response.body.data?.getDashboardLayoutByUrl.type).toBe('DASHBOARD');
    expect(
      response.body.data?.getDashboardLayoutByUrl.activePresetFilterState,
    ).toEqual({
      probability: {
        gte: 70,
      },
    });
  });
});
