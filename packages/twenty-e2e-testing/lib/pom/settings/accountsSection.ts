import { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AccountsSection {
  private readonly addAccountButton: Locator;
  private readonly deleteAccountButton: Locator;
  private readonly addBlocklistField: Locator;
  private readonly addBlocklistButton: Locator;
  private readonly descriptionEditor: Locator;
  private readonly saveDescriptionButton: Locator;
  private readonly connectWithGoogleButton: Locator;
  private readonly connectWithMicrosoftButton: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.addAccountButton = page.getByRole('button', { name: 'Add account' });
    this.deleteAccountButton = page
      .getByTestId('tooltip')
      .getByText('Remove account');
    this.addBlocklistField = page.getByPlaceholder(
      'eddy@gmail.com, @apple.com',
    );
    this.addBlocklistButton = page.getByRole('button', {
      name: 'Add to blocklist',
    });
    this.descriptionEditor = page.getByPlaceholder('Add a description');
    this.saveDescriptionButton = page.getByRole('button', {
      name: 'Save',
    });
    this.connectWithGoogleButton = page.getByRole('button', {
      name: 'Connect with Google',
    });
    this.connectWithMicrosoftButton = page.getByRole('button', {
      name: 'Connect with Microsoft',
    });
  }

  async clickAddAccount() {
    await this.addAccountButton.click();
  }

  async deleteAccount(email: string) {
    await this.page
      .locator(`//span[contains(., "${email}")]/../div/div/div/button`)
      .click();
    await this.deleteAccountButton.click();
  }

  async addToBlockList(domain: string) {
    await this.addBlocklistField.fill(domain);
    await this.addBlocklistButton.click();
  }

  async removeFromBlocklist(domain: string) {
    await this.page
      .locator(
        `//div[@data-testid='tooltip' and contains(., '${domain}')]/../../div[last()]/button`,
      )
      .click();
  }

  async expectBlocklistHandle(handle: string) {
    await expect(this.page.getByText(handle)).toBeVisible();
  }

  async expectBlocklistDescription(handle: string, description: string) {
    await expect(
      this.page
        .locator('tr, div')
        .filter({ has: this.page.getByText(handle) })
        .getByText(description),
    ).toBeVisible();
  }

  async expectEmptyBlocklistDescription(handle: string) {
    await expect(
      this.page
        .locator('tr, div')
        .filter({ has: this.page.getByText(handle) })
        .getByText('No description'),
    ).toBeVisible();
  }

  async openDescriptionEditor(handle: string) {
    await this.page
      .locator('tr, div')
      .filter({ has: this.page.getByText(handle) })
      .getByRole('button', { name: 'Edit' })
      .click();
  }

  async fillDescriptionEditor(description: string) {
    await this.descriptionEditor.fill(description);
  }

  async clearDescriptionEditor() {
    await this.descriptionEditor.clear();
  }

  async saveDescriptionEditor() {
    await this.saveDescriptionButton.click();
  }

  async linkGoogleAccount() {
    await this.connectWithGoogleButton.click();
  }

  async linkMicrosoftAccount() {
    await this.connectWithMicrosoftButton.click();
  }
}
