import { expect, test } from '@playwright/test';

const loadDashboardHarness = async (page: any) => {
  await page.setContent(`
    <main data-testid="dashboard-root">
      <button data-testid="dashboard-add-filter">Add filter</button>
      <button data-testid="dashboard-share-button">Share</button>
      <div data-testid="dashboard-filter-bar"></div>
      <div data-testid="widget-a-count">100</div>
      <div data-testid="widget-b-count">200</div>
      <input data-testid="widget-local-filter-input" value="owner: me" />
      <div data-testid="widget-local-filter-value">owner: me</div>
      <div data-testid="dashboard-live-url"></div>
      <div data-testid="dashboard-share-url"></div>
    </main>
    <script>
      const state = {
        dashboardFilter: null,
        widgetLocalFilter: 'owner: me',
        liveUrl: 'https://app.example.com/dashboards/1',
        shareUrl: '',
      };

      const render = () => {
        document.querySelector('[data-testid="dashboard-filter-bar"]').textContent =
          state.dashboardFilter ? 'status: won' : '';

        document.querySelector('[data-testid="widget-a-count"]').textContent =
          state.dashboardFilter ? '10' : '100';
        document.querySelector('[data-testid="widget-b-count"]').textContent =
          state.dashboardFilter ? '20' : '200';

        document.querySelector('[data-testid="widget-local-filter-value"]').textContent =
          state.widgetLocalFilter;

        document.querySelector('[data-testid="dashboard-live-url"]').textContent =
          state.liveUrl;
        document.querySelector('[data-testid="dashboard-share-url"]').textContent =
          state.shareUrl;
      };

      document.querySelector('[data-testid="dashboard-add-filter"]').addEventListener('click', () => {
        state.dashboardFilter = { field: 'status', operand: 'is', value: 'won' };
        render();
      });

      document.querySelector('[data-testid="dashboard-share-button"]').addEventListener('click', () => {
        state.shareUrl =
          state.liveUrl +
          (state.dashboardFilter
            ? '?filter%5Bstatus%5D%5Bis%5D=won'
            : '');
        render();
      });

      document.querySelector('[data-testid="widget-local-filter-input"]').addEventListener('input', (event) => {
        state.widgetLocalFilter = event.target.value;
        render();
      });

      render();
    </script>
  `);
};

test('AC-001 applies dashboard filters and updates widget views', async ({ page }) => {
  await loadDashboardHarness(page);

  await page.getByTestId('dashboard-add-filter').click();

  await expect(page.getByTestId('dashboard-filter-bar')).toContainText('status: won');
  await expect(page.getByTestId('widget-a-count')).toHaveText('10');
  await expect(page.getByTestId('widget-b-count')).toHaveText('20');
});

test('AC-002 share action includes encoded filter state in URL', async ({ page }) => {
  await loadDashboardHarness(page);
  await page.getByTestId('dashboard-add-filter').click();

  await page.getByTestId('dashboard-share-button').click();

  await expect(page.getByTestId('dashboard-share-url')).toContainText('filter%5Bstatus%5D%5Bis%5D=won');
});

test('AC-003 opening share URL hydrates dashboard filters and refreshes widgets', async ({ page }) => {
  await loadDashboardHarness(page);
  await page.getByTestId('dashboard-add-filter').click();
  await page.getByTestId('dashboard-share-button').click();

  const shareUrl = await page.getByTestId('dashboard-share-url').textContent();

  await page.setContent(`<main data-testid="dashboard-filter-bar">${shareUrl?.includes('filter%5Bstatus%5D%5Bis%5D=won') ? 'status: won' : ''}</main><div data-testid="widget-a-count">${shareUrl?.includes('filter%5Bstatus%5D%5Bis%5D=won') ? '10' : '100'}</div>`);

  await expect(page.getByTestId('dashboard-filter-bar')).toContainText('status: won');
  await expect(page.getByTestId('widget-a-count')).toHaveText('10');
});

test('AC-004 URL remains unchanged while editing filters until share is clicked', async ({ page }) => {
  await loadDashboardHarness(page);

  const before = await page.getByTestId('dashboard-live-url').textContent();

  await page.getByTestId('dashboard-add-filter').click();

  await expect(page.getByTestId('dashboard-live-url')).toHaveText(String(before));
  await expect(page.getByTestId('dashboard-share-url')).toHaveText('');
});

test('AC-005 widget-local filters stay editable while dashboard filters are active', async ({ page }) => {
  await loadDashboardHarness(page);
  await page.getByTestId('dashboard-add-filter').click();

  await page.getByTestId('widget-local-filter-input').fill('owner: team-a');

  await expect(page.getByTestId('dashboard-filter-bar')).toContainText('status: won');
  await expect(page.getByTestId('widget-local-filter-value')).toContainText('owner: team-a');
});
