import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type ReactNode } from 'react';
import {
  THEME_LIGHT,
  ThemeContextProvider,
  ThemeProvider,
} from 'twenty-ui/theme';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  WorkspaceMemberDateFormatEnum,
  WorkspaceMemberTimeFormatEnum,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockCreateOneRecord = jest.fn();
const mockDeleteOneRecord = jest.fn();

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: () => ({ records: [] }),
}));

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: () => ({
    createOneRecord: mockCreateOneRecord,
  }),
}));

jest.mock('@/object-record/hooks/useDeleteOneRecord', () => ({
  useDeleteOneRecord: () => ({
    deleteOneRecord: mockDeleteOneRecord,
  }),
}));

const ApolloWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <ThemeProvider theme={THEME_LIGHT}>
      <ThemeContextProvider theme={THEME_LIGHT}>
        <ApolloWrapper>{children}</ApolloWrapper>
      </ThemeContextProvider>
    </ThemeProvider>
  </I18nProvider>
);

describe('SettingsAccountsBlocklistSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jotaiStore.set(currentWorkspaceMemberState.atom, {
      id: 'workspace-member-id',
      name: {
        firstName: 'Ada',
        lastName: 'Lovelace',
      },
      colorScheme: 'Light',
      locale: 'en',
      timeZone: 'UTC',
      dateFormat: WorkspaceMemberDateFormatEnum.DAY_FIRST,
      timeFormat: WorkspaceMemberTimeFormatEnum.HOUR_24,
      avatarUrl: '',
      userEmail: 'ada@example.com',
    });
  });

  it('should submit handle and description when creating a blocklist entry', async () => {
    render(<SettingsAccountsBlocklistSection />, { wrapper: Wrapper });

    await userEvent.type(
      screen.getByPlaceholderText('eddy@gmail.com, @apple.com'),
      'spam@example.com',
    );
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Description' }),
      'Known spam source',
    );
    await userEvent.click(
      screen.getByRole('button', { name: /add to blocklist/i }),
    );

    await waitFor(() => {
      expect(mockCreateOneRecord).toHaveBeenCalledWith({
        handle: 'spam@example.com',
        description: 'Known spam source',
        workspaceMemberId: 'workspace-member-id',
      });
    });
  });

  it('should submit a null description when the description is empty', async () => {
    render(<SettingsAccountsBlocklistSection />, { wrapper: Wrapper });

    await userEvent.type(
      screen.getByPlaceholderText('eddy@gmail.com, @apple.com'),
      'badactor.com',
    );
    await userEvent.click(
      screen.getByRole('button', { name: /add to blocklist/i }),
    );

    await waitFor(() => {
      expect(mockCreateOneRecord).toHaveBeenCalledWith({
        handle: 'badactor.com',
        description: null,
        workspaceMemberId: 'workspace-member-id',
      });
    });
  });
});
