import { type Locator, type Page } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly filterBar: Locator;
  readonly tabs: Locator;
  readonly widgetUpdateIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filterBar = page.getByTestId('dashboard-filter-bar');
    this.tabs = page.getByTestId('dashboard-tabs');
    this.widgetUpdateIndicator = page.getByTestId(
      'dashboard-global-filter-update-indicator',
    );
  }

  async gotoDashboard() {
    await this.page.goto('/object/dashboards');
  }

  filterSelect(fieldName: string) {
    return this.page.getByTestId(`dashboard-filter-select-${fieldName}`);
  }

  filterPill(fieldName: string, value: string) {
    return this.page.getByTestId(`dashboard-filter-pill-${fieldName}-${value}`);
  }

  filterPillRemoveButton(fieldName: string, value: string) {
    return this.page.getByTestId(
      `dashboard-filter-pill-remove-${fieldName}-${value}`,
    );
  }

  clearAllButton() {
    return this.page.getByTestId('dashboard-filter-clear-all');
  }
}
