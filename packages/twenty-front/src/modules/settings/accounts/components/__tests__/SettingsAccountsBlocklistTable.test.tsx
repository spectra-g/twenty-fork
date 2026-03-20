import { render, screen, waitFor } from '@testing-library/react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import userEvent from '@testing-library/user-event';
// eslint-disable-next-line @nx/enforce-module-boundaries
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

  it('should save a 255-character description', async () => {
    renderSettingsAccountsBlocklistTable();

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);

    const descriptionInput = screen.getByPlaceholderText('Add a description');
    const maxLengthDescription = 'a'.repeat(255);

    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, maxLengthDescription);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(handleBlockedEmailDescriptionUpdate).toHaveBeenCalledWith(
        '1',
        maxLengthDescription,
      );
    });
  });

  it('should block the 256th description character and show the max counter', async () => {
    renderSettingsAccountsBlocklistTable();

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);

    const descriptionInput = screen.getByPlaceholderText('Add a description');
    const maxLengthDescription = 'a'.repeat(255);

    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, `${maxLengthDescription}b`);

    expect(descriptionInput).toHaveValue(maxLengthDescription);
    expect(screen.getByText('255/255')).toBeInTheDocument();
    expect(
      screen.queryByText('Description must be 255 characters or less'),
    ).not.toBeInTheDocument();
  });

  it('should show the backend validation error when saving fails', async () => {
    handleBlockedEmailDescriptionUpdate.mockRejectedValueOnce(
      new Error('Description must be 255 characters or less'),
    );

    renderSettingsAccountsBlocklistTable();

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);

    const descriptionInput = screen.getByPlaceholderText('Add a description');

    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, 'Valid description');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByText('Description must be 255 characters or less'),
      ).toBeInTheDocument();
    });

    expect(handleBlockedEmailDescriptionUpdate).toHaveBeenCalledWith(
      '1',
      'Valid description',
    );
    expect(descriptionInput).toHaveValue('Valid description');
  });
});
