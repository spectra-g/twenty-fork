// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { test, expect } from '@playwright/test';

import { DashboardPage } from '../lib/pom/dashboardPage';

test.describe('dashboard persistent filter bar', () => {
  test.skip('AC-001: dashboard loads with persistent filter bar above tabs', async ({
    page,
  }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.gotoDashboard();

    await expect(dashboardPage.filterBar).toBeVisible();
    await expect(dashboardPage.tabs).toBeVisible();

    const filterBarBox = await dashboardPage.filterBar.boundingBox();
    const tabsBox = await dashboardPage.tabs.boundingBox();

    expect(filterBarBox?.y).toBeLessThan(tabsBox?.y ?? Number.POSITIVE_INFINITY);
  });

  test.skip('AC-002: selecting a filter shows a pill and widget update indicator', async ({
    page,
  }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.gotoDashboard();
    await dashboardPage.filterSelect('status').selectOption('Active Deals');

    await expect(
      dashboardPage.filterPill('status', 'Active Deals'),
    ).toBeVisible();
    await expect(dashboardPage.widgetUpdateIndicator).toHaveText(
      'Filters updated',
    );
  });

  test.skip('AC-003: active filter pills can be removed individually and cleared', async ({
    page,
  }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.gotoDashboard();
    await dashboardPage.filterSelect('status').selectOption('Active Deals');
    await dashboardPage.filterSelect('owner').selectOption('Assigned to me');

    await expect(
      dashboardPage.filterPill('status', 'Active Deals'),
    ).toBeVisible();
    await expect(
      dashboardPage.filterPill('owner', 'Assigned to me'),
    ).toBeVisible();

    await dashboardPage
      .filterPillRemoveButton('status', 'Active Deals')
      .click();
    await expect(
      dashboardPage.filterPill('status', 'Active Deals'),
    ).not.toBeVisible();

    await dashboardPage.clearAllButton().click();
    await expect(
      dashboardPage.filterPill('owner', 'Assigned to me'),
    ).not.toBeVisible();
  });
});
