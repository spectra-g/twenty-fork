// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '@playwright/test';

import { AccountsSection } from '../lib/pom/settings/accountsSection';
import { SettingsPage } from '../lib/pom/settingsPage';

test.describe('Settings accounts blocklist descriptions', () => {
  test.skip('AC-001 should display a blocklist description in the accounts settings table', async ({
    page,
  }) => {
    const settingsPage = new SettingsPage(page);
    const accountsSection = new AccountsSection(page);

    await page.goto('/settings/accounts');
    await settingsPage.goToAccountsSection();

    await accountsSection.addToBlockList('prospect@example.com');
    await accountsSection.expectBlocklistHandle('prospect@example.com');
    await accountsSection.expectBlocklistDescription(
      'prospect@example.com',
      'Inbound lead from conference follow-up',
    );
  });

  test.skip('AC-002 should edit and save a blocklist description from the accounts settings table', async ({
    page,
  }) => {
    const settingsPage = new SettingsPage(page);
    const accountsSection = new AccountsSection(page);

    await page.goto('/settings/accounts');
    await settingsPage.goToAccountsSection();

    await accountsSection.expectBlocklistHandle('prospect@example.com');
    await accountsSection.openDescriptionEditor('prospect@example.com');
    await accountsSection.fillDescriptionEditor(
      'Updated after contact requested no follow-up',
    );
    await accountsSection.saveDescriptionEditor();

    await accountsSection.expectBlocklistDescription(
      'prospect@example.com',
      'Updated after contact requested no follow-up',
    );
  });

  test.skip('AC-003 should clear a blocklist description and show the empty state gracefully', async ({
    page,
  }) => {
    const settingsPage = new SettingsPage(page);
    const accountsSection = new AccountsSection(page);

    await page.goto('/settings/accounts');
    await settingsPage.goToAccountsSection();

    await accountsSection.expectBlocklistHandle('prospect@example.com');
    await accountsSection.openDescriptionEditor('prospect@example.com');
    await accountsSection.clearDescriptionEditor();
    await accountsSection.saveDescriptionEditor();

    await accountsSection.expectEmptyBlocklistDescription(
      'prospect@example.com',
    );
  });
});
