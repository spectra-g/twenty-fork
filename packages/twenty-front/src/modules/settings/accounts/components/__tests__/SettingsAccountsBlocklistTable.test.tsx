import { render, screen, waitFor } from '@testing-library/react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import userEvent from '@testing-library/user-event';
import {
  THEME_LIGHT,
  ThemeContextProvider,
  ThemeProvider,
} from 'twenty-ui/theme';

import { SettingsAccountsBlocklistTable } from '@/settings/accounts/components/SettingsAccountsBlocklistTable';
import { mockedBlocklist } from '@/settings/accounts/components/__stories__/mockedBlocklist';

const handleBlockedEmailDescriptionUpdate = jest.fn();

const renderSettingsAccountsBlocklistTable = () =>
  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider theme={THEME_LIGHT}>
        <ThemeContextProvider theme={THEME_LIGHT}>
          <SettingsAccountsBlocklistTable
            blocklist={mockedBlocklist}
            handleBlockedEmailRemove={jest.fn()}
            handleBlockedEmailDescriptionUpdate={
              handleBlockedEmailDescriptionUpdate
            }
          />
        </ThemeContextProvider>
      </ThemeProvider>
    </I18nProvider>,
  );

describe('SettingsAccountsBlocklistTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render blocklist descriptions when present', () => {
    renderSettingsAccountsBlocklistTable();

    expect(
      screen.getByText('Block the finance follow-up thread'),
    ).toBeInTheDocument();
  });

  it('should let users edit and save a blocklist description', async () => {
    renderSettingsAccountsBlocklistTable();

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);

    const descriptionInput = screen.getByPlaceholderText('Add a description');

    await userEvent.clear(descriptionInput);
    await userEvent.type(
      descriptionInput,
      'Updated after contact requested no follow-up',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(handleBlockedEmailDescriptionUpdate).toHaveBeenCalledWith(
        '1',
        'Updated after contact requested no follow-up',
      );
    });
    expect(
      screen.getByText('Updated after contact requested no follow-up'),
    ).toBeInTheDocument();
  });

  it('should clear a blocklist description and show the empty state', async () => {
    renderSettingsAccountsBlocklistTable();

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);

    const descriptionInput = screen.getByPlaceholderText('Add a description');

    await userEvent.clear(descriptionInput);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(handleBlockedEmailDescriptionUpdate).toHaveBeenCalledWith(
        '1',
        null,
      );
    });
    expect(
      screen.queryByText('Block the finance follow-up thread'),
    ).not.toBeInTheDocument();
  });

  it('should prevent saving descriptions longer than 255 characters', async () => {
    renderSettingsAccountsBlocklistTable();

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);

    const descriptionInput = screen.getByPlaceholderText('Add a description');
    const longDescription = 'a'.repeat(256);

    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, longDescription);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      screen.getByText('Description must be 255 characters or less'),
    ).toBeInTheDocument();
    expect(handleBlockedEmailDescriptionUpdate).not.toHaveBeenCalled();
  });
});
