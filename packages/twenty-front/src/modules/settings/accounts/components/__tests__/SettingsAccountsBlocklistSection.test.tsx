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

import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: jest.fn(),
}));
jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: jest.fn(),
}));
jest.mock('@/object-record/hooks/useDeleteOneRecord', () => ({
  useDeleteOneRecord: jest.fn(),
}));
jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: jest.fn(),
}));
jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: jest.fn(),
}));

const createOneRecord = jest.fn();
const mockUseAtomStateValue = useAtomStateValue as jest.MockedFunction<
  typeof useAtomStateValue
>;
const mockUseFindManyRecords = useFindManyRecords as jest.MockedFunction<
  typeof useFindManyRecords
>;
const mockUseCreateOneRecord = useCreateOneRecord as jest.MockedFunction<
  typeof useCreateOneRecord
>;
const mockUseDeleteOneRecord = useDeleteOneRecord as jest.MockedFunction<
  typeof useDeleteOneRecord
>;
const mockUseUpdateOneRecord = useUpdateOneRecord as jest.MockedFunction<
  typeof useUpdateOneRecord
>;

const renderSettingsAccountsBlocklistSection = () =>
  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider theme={THEME_LIGHT}>
        <ThemeContextProvider theme={THEME_LIGHT}>
          <SettingsAccountsBlocklistSection />
        </ThemeContextProvider>
      </ThemeProvider>
    </I18nProvider>,
  );

describe('SettingsAccountsBlocklistSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAtomStateValue.mockReturnValue({
      id: 'workspace-member-id',
    });
    mockUseFindManyRecords.mockReturnValue({
      records: [],
    } as never);
    mockUseCreateOneRecord.mockReturnValue({
      createOneRecord,
    } as never);
    mockUseDeleteOneRecord.mockReturnValue({
      deleteOneRecord: jest.fn(),
    } as never);
    mockUseUpdateOneRecord.mockReturnValue({
      updateOneRecord: jest.fn(),
    } as never);
  });

  it('should submit a null description when creating a blocklist item', async () => {
    renderSettingsAccountsBlocklistSection();

    await userEvent.type(
      screen.getByRole('textbox'),
      'normalized-description@example.com',
    );
    await userEvent.click(
      screen.getByRole('button', { name: /Add to blocklist/ }),
    );

    await waitFor(() => {
      expect(createOneRecord).toHaveBeenCalledWith({
        handle: 'normalized-description@example.com',
        description: null,
        workspaceMemberId: 'workspace-member-id',
      });
    });
  });
});
