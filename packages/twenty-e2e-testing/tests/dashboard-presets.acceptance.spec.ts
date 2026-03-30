// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { type Page } from '@playwright/test';
import { expect, test } from '../lib/fixtures/screenshot';
import { LoginPage } from '../lib/pom/loginPage';
import { backendGraphQLUrl } from '../lib/requests/backend';
import { getAccessAuthToken } from '../lib/utils/getAccessAuthToken';

const createDashboardMutation = `
  mutation CreateDashboard($input: DashboardCreateInput!) {
    createDashboard(data: $input) {
      id
      title
    }
  }
`;

const dashboardFiltersAndPresetsQuery = `
  query DashboardFiltersAndPresets($dashboardId: UUID!) {
    dashboardFiltersAndPresets(dashboardId: $dashboardId) {
      activeFilterState
      presets {
        id
        name
        filterState
        lastUsedAt
      }
    }
  }
`;

const saveDashboardPresetMutation = `
  mutation SaveDashboardPreset(
    $dashboardId: UUID!
    $name: String!
    $filterState: JSON
  ) {
    saveDashboardPreset(
      dashboardId: $dashboardId
      name: $name
      filterState: $filterState
    ) {
      success
      preset {
        id
        name
        filterState
        lastUsedAt
      }
    }
  }
`;

const touchDashboardPresetMutation = `
  mutation TouchDashboardPreset($presetId: UUID!) {
    touchDashboardPreset(presetId: $presetId) {
      success
      preset {
        id
        name
        filterState
        lastUsedAt
      }
    }
  }
`;

const authenticateAndCreateDashboard = async (page: Page) => {
  const loginPage = new LoginPage(page);

  await page.goto('/');
  await loginPage.clickLoginWithEmailIfVisible();
  await loginPage.clickContinueButton();
  await loginPage.clickSignInButton();

  const { authToken } = await getAccessAuthToken(page);

  const dashboardResponse = await page.request.post(backendGraphQLUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    data: {
      operationName: 'CreateDashboard',
      query: createDashboardMutation,
      variables: {
        input: {
          title: `Dashboard Presets ${Date.now()}`,
          position: 0,
        },
      },
    },
  });

  expect(dashboardResponse.ok()).toBe(true);

  const dashboardBody = await dashboardResponse.json();

  return {
    authToken,
    dashboardId: dashboardBody.data.createDashboard.id as string,
  };
};

test.skip('returns null active filter state and an empty preset list for a dashboard', async ({
  page,
}) => {
  const { authToken, dashboardId } = await authenticateAndCreateDashboard(page);

  const response = await page.request.post(backendGraphQLUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    data: {
      operationName: 'DashboardFiltersAndPresets',
      query: dashboardFiltersAndPresetsQuery,
      variables: {
        dashboardId,
      },
    },
  });

  expect(response.ok()).toBe(true);

  const body = await response.json();

  expect(body.errors).toBeUndefined();
  expect(body.data.dashboardFiltersAndPresets).toEqual({
    activeFilterState: null,
    presets: [],
  });
});

test.skip('saves a dashboard preset and returns a success payload', async ({
  page,
}) => {
  const { authToken, dashboardId } = await authenticateAndCreateDashboard(page);
  const filterState = {
    recordFilters: [
      {
        fieldMetadataId: 'company-id',
        operand: 'contains',
        value: 'Acme',
      },
    ],
    recordFilterGroups: [
      {
        id: 'group-1',
        logicalOperator: 'AND',
      },
    ],
  };

  const response = await page.request.post(backendGraphQLUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    data: {
      operationName: 'SaveDashboardPreset',
      query: saveDashboardPresetMutation,
      variables: {
        dashboardId,
        name: 'My Pipeline Preset',
        filterState,
      },
    },
  });

  expect(response.ok()).toBe(true);

  const body = await response.json();

  expect(body.errors).toBeUndefined();
  expect(body.data.saveDashboardPreset.success).toBe(true);
  expect(body.data.saveDashboardPreset.preset.id).toBeTruthy();
  expect(body.data.saveDashboardPreset.preset.name).toBe(
    'My Pipeline Preset',
  );
  expect(body.data.saveDashboardPreset.preset.filterState).toEqual(filterState);
  expect(body.data.saveDashboardPreset.preset.lastUsedAt).toBeTruthy();
});

test.skip('persists dashboard presets across reload-oriented reads with their filter state intact', async ({
  page,
}) => {
  const { authToken, dashboardId } = await authenticateAndCreateDashboard(page);
  const filterState = {
    recordFilters: [
      {
        fieldMetadataId: 'company-id',
        operand: 'contains',
        value: 'Acme',
      },
    ],
    recordFilterGroups: [
      {
        id: 'group-1',
        logicalOperator: 'AND',
      },
    ],
  };

  const saveResponse = await page.request.post(backendGraphQLUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    data: {
      operationName: 'SaveDashboardPreset',
      query: saveDashboardPresetMutation,
      variables: {
        dashboardId,
        name: 'Persisted Preset',
        filterState,
      },
    },
  });

  expect(saveResponse.ok()).toBe(true);

  const reloadedResponse = await page.request.post(backendGraphQLUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    data: {
      operationName: 'DashboardFiltersAndPresets',
      query: dashboardFiltersAndPresetsQuery,
      variables: {
        dashboardId,
      },
    },
  });

  expect(reloadedResponse.ok()).toBe(true);

  const reloadedBody = await reloadedResponse.json();

  expect(reloadedBody.errors).toBeUndefined();
  expect(reloadedBody.data.dashboardFiltersAndPresets.activeFilterState).toBeNull();
  expect(reloadedBody.data.dashboardFiltersAndPresets.presets).toEqual([
    expect.objectContaining({
      name: 'Persisted Preset',
      filterState,
      lastUsedAt: expect.any(String),
    }),
  ]);
});

test.skip('returns dashboard presets ordered by most recently used after explicit preset selection', async ({
  page,
}) => {
  const { authToken, dashboardId } = await authenticateAndCreateDashboard(page);

  const buildFilterState = (value: string) => ({
    recordFilters: [
      {
        fieldMetadataId: 'company-id',
        operand: 'contains',
        value,
      },
    ],
    recordFilterGroups: [
      {
        id: `group-${value}`,
        logicalOperator: 'AND',
      },
    ],
  });

  const presetIds: string[] = [];

  for (const [name, value] of [
    ['Preset A', 'Acme'],
    ['Preset B', 'Globex'],
    ['Preset C', 'Initech'],
  ] as const) {
    const saveResponse = await page.request.post(backendGraphQLUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        operationName: 'SaveDashboardPreset',
        query: saveDashboardPresetMutation,
        variables: {
          dashboardId,
          name,
          filterState: buildFilterState(value),
        },
      },
    });

    expect(saveResponse.ok()).toBe(true);

    const saveBody = await saveResponse.json();

    expect(saveBody.errors).toBeUndefined();
    presetIds.push(saveBody.data.saveDashboardPreset.preset.id as string);
  }

  for (const presetId of [presetIds[1], presetIds[0], presetIds[2]]) {
    const touchResponse = await page.request.post(backendGraphQLUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        operationName: 'TouchDashboardPreset',
        query: touchDashboardPresetMutation,
        variables: {
          presetId,
        },
      },
    });

    expect(touchResponse.ok()).toBe(true);

    const touchBody = await touchResponse.json();

    expect(touchBody.errors).toBeUndefined();
    expect(touchBody.data.touchDashboardPreset.success).toBe(true);
  }

  const listResponse = await page.request.post(backendGraphQLUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    data: {
      operationName: 'DashboardFiltersAndPresets',
      query: dashboardFiltersAndPresetsQuery,
      variables: {
        dashboardId,
      },
    },
  });

  expect(listResponse.ok()).toBe(true);

  const listBody = await listResponse.json();

  expect(listBody.errors).toBeUndefined();
  expect(
    listBody.data.dashboardFiltersAndPresets.presets.map(
      (preset: { name: string }) => preset.name,
    ),
  ).toEqual(['Preset C', 'Preset A', 'Preset B']);
});

test.skip('rejects an invalid dashboard preset payload with a required filter state message', async ({
  page,
}) => {
  const { authToken, dashboardId } = await authenticateAndCreateDashboard(page);

  const response = await page.request.post(backendGraphQLUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    data: {
      operationName: 'SaveDashboardPreset',
      query: saveDashboardPresetMutation,
      variables: {
        dashboardId,
        name: 'Invalid Preset',
        filterState: null,
      },
    },
  });

  expect(response.ok()).toBe(true);

  const body = await response.json();

  expect(body.data).toBeNull();
  expect(body.errors).toHaveLength(1);
  expect(body.errors[0].message).toBe('Filter state is required');
  expect(body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
});
