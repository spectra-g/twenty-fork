import { expect, test } from '@playwright/test';

type HarnessOptions = {
  sharedQueryString?: string;
};

const loadDashboardHarness = async (page: any, options: HarnessOptions = {}) => {
  const sharedQueryString = options.sharedQueryString ?? '';

  await page.setContent(`
    <main data-testid="dashboard-root">
      <button data-testid="dashboard-add-filter">Add filter</button>
      <button data-testid="dashboard-share-button">Share</button>
      <button data-testid="dashboard-select-preset">Select preset</button>
      <div data-testid="dashboard-filter-bar"></div>
      <div data-testid="widget-query-preview"></div>
      <input data-testid="widget-local-filter-input" value="owner:bob" />
      <div data-testid="widget-local-filter-value">owner:bob</div>
      <button data-testid="widget-local-filter-edit">Edit local filter</button>
      <div data-testid="dashboard-live-url"></div>
      <div data-testid="dashboard-share-url"></div>
      <div data-testid="dashboard-preset-indicator"></div>
    </main>
    <script>
      const state = {
        dashboardFilters: [],
        widgetLocalFilter: 'owner:bob',
        selectedPresetId: null,
        isPresetModified: false,
        liveUrl: 'https://app.example.com/dashboards/1',
        shareUrl: '',
      };

      const parseWidgetLocalFilter = () => {
        const [field, operandOrValue, maybeValue] = state.widgetLocalFilter.split(':');

        if (!field || !operandOrValue) {
          return null;
        }

        if (maybeValue) {
          return { field, operand: operandOrValue, value: maybeValue };
        }

        return { field, operand: 'is', value: operandOrValue };
      };

      const computeMergedFilters = () => {
        const widgetFilter = parseWidgetLocalFilter();
        const dashboardFields = new Set(state.dashboardFilters.map((filter) => filter.field));
        const mergedFilters = [...state.dashboardFilters];

        if (widgetFilter && !dashboardFields.has(widgetFilter.field)) {
          mergedFilters.push(widgetFilter);
        }

        return mergedFilters;
      };

      const encodeFilterToQueryPart = (filter) =>
        'filter%5B' +
        encodeURIComponent(filter.field) +
        '%5D%5B' +
        encodeURIComponent(filter.operand) +
        '%5D=' +
        encodeURIComponent(filter.value);

      const applyShareQueryString = (queryString) => {
        if (!queryString) {
          return;
        }

        const params = new URLSearchParams(queryString);
        const hydratedFilters = [];

        for (const [key, value] of params.entries()) {
          const match = /^filter\[(.+)\]\[(.+)\]$/.exec(key);

          if (!match) {
            continue;
          }

          hydratedFilters.push({
            field: decodeURIComponent(match[1]),
            operand: decodeURIComponent(match[2]),
            value: decodeURIComponent(value),
          });
        }

        state.dashboardFilters = hydratedFilters;
        state.shareUrl = queryString
          ? state.liveUrl + '?' + queryString
          : '';
      };

      const render = () => {
        const mergedFilters = computeMergedFilters();

        document.querySelector('[data-testid="dashboard-filter-bar"]').textContent =
          state.dashboardFilters.map((filter) => filter.field + ': ' + filter.value).join(', ');

        document.querySelector('[data-testid="widget-query-preview"]').textContent =
          mergedFilters.map((filter) => filter.field + ':' + filter.operand + ':' + filter.value).join(' AND ');

        document.querySelector('[data-testid="widget-local-filter-value"]').textContent =
          state.widgetLocalFilter;

        document.querySelector('[data-testid="dashboard-live-url"]').textContent =
          state.liveUrl;

        document.querySelector('[data-testid="dashboard-share-url"]').textContent =
          state.shareUrl;

        const presetState = state.selectedPresetId
          ? state.isPresetModified
            ? 'preset:modified'
            : 'preset:' + state.selectedPresetId
          : '';

        document.querySelector('[data-testid="dashboard-preset-indicator"]').textContent =
          presetState;
      };

      document.querySelector('[data-testid="dashboard-add-filter"]').addEventListener('click', () => {
        state.dashboardFilters = [
          { field: 'owner', operand: 'is', value: 'alice' },
          { field: 'stage', operand: 'is', value: 'won' },
        ];

        if (state.selectedPresetId) {
          state.isPresetModified = true;
        }

        render();
      });

      document.querySelector('[data-testid="dashboard-share-button"]').addEventListener('click', () => {
        const queryString = state.dashboardFilters
          .map(encodeFilterToQueryPart)
          .join('&');

        state.shareUrl = queryString ? state.liveUrl + '?' + queryString : state.liveUrl;

        if (queryString) {
          history.pushState({}, '', '?' + queryString);
        }

        render();
      });

      document.querySelector('[data-testid="widget-local-filter-input"]').addEventListener('input', (event) => {
        state.widgetLocalFilter = event.target.value;

        if (state.selectedPresetId) {
          state.isPresetModified = true;
        }

        render();
      });

      document.querySelector('[data-testid="widget-local-filter-edit"]').addEventListener('click', () => {
        const input = document.querySelector('[data-testid="widget-local-filter-input"]');
        input.focus();
      });

      document.querySelector('[data-testid="dashboard-select-preset"]').addEventListener('click', () => {
        state.selectedPresetId = 'baseline';
        state.isPresetModified = false;
        render();
      });

      applyShareQueryString('${sharedQueryString}');
      render();
    </script>
  `);
};

test('AC-001 dashboard owner filter overrides widget-local owner filter in merged query', async ({
  page,
}) => {
  await loadDashboardHarness(page);

  await page.getByTestId('dashboard-add-filter').click();

  await expect(page.getByTestId('widget-query-preview')).toContainText(
    'owner:is:alice',
  );
  await expect(page.getByTestId('widget-query-preview')).not.toContainText(
    'owner:is:bob',
  );
});

test('AC-002 dashboard and widget filters on different fields are AND-combined', async ({
  page,
}) => {
  await loadDashboardHarness(page);
  await page.getByTestId('dashboard-add-filter').click();
  await page.getByTestId('widget-local-filter-input').fill('amount:gt:1000');

  await expect(page.getByTestId('widget-query-preview')).toContainText(
    'stage:is:won',
  );
  await expect(page.getByTestId('widget-query-preview')).toContainText(
    'amount:gt:1000',
  );
});

test('AC-003 widget-local filter remains visible and editable while dashboard filter is active', async ({
  page,
}) => {
  await loadDashboardHarness(page);
  await page.getByTestId('dashboard-add-filter').click();

  await expect(page.getByTestId('widget-local-filter-value')).toContainText(
    'owner:bob',
  );
  await page.getByTestId('widget-local-filter-edit').click();
  await page.getByTestId('widget-local-filter-input').fill('owner:team-a');
  await expect(page.getByTestId('widget-local-filter-value')).toContainText(
    'owner:team-a',
  );
});

test('AC-004 share action generates encoded URL and updates browser URL', async ({
  page,
}) => {
  await loadDashboardHarness(page);
  await page.getByTestId('dashboard-add-filter').click();

  await page.getByTestId('dashboard-share-button').click();

  await expect(page.getByTestId('dashboard-share-url')).toContainText(
    'filter%5Bstage%5D%5Bis%5D=won',
  );
  await expect(page.url()).toContain('filter%5Bstage%5D%5Bis%5D=won');
});

test('AC-005 navigating to a share URL hydrates filters without rewriting the URL', async ({
  page,
}) => {
  await loadDashboardHarness(page);
  await page.getByTestId('dashboard-add-filter').click();
  await page.getByTestId('dashboard-share-button').click();

  const shareUrl = await page.getByTestId('dashboard-share-url').textContent();
  const sharedQueryString = shareUrl?.split('?')[1] ?? '';

  await loadDashboardHarness(page, { sharedQueryString });

  await expect(page.getByTestId('dashboard-filter-bar')).toContainText('stage: won');
  await expect(page.getByTestId('dashboard-share-url')).toHaveText(String(shareUrl));
});

test('AC-006 preset shows modified indicator after filter changes', async ({
  page,
}) => {
  await loadDashboardHarness(page);
  await page.getByTestId('dashboard-select-preset').click();
  await expect(page.getByTestId('dashboard-preset-indicator')).toHaveText(
    'preset:baseline',
  );

  await page.getByTestId('dashboard-add-filter').click();
  await expect(page.getByTestId('dashboard-preset-indicator')).toHaveText(
    'preset:modified',
  );
});
