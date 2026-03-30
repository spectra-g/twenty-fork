import { DashboardFilterBar } from '@/dashboards/components/DashboardFilterBar';
import { useDashboardPresets } from '@/dashboards/hooks/useDashboardPresets';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ThemeProvider } from '@emotion/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { type PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@/dashboards/hooks/useDashboardPresets');
jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar');
jest.mock('@/ui/input/components/Select', () => ({
  Select: ({
    disabled,
    label,
    onChange,
    options,
    value,
  }: {
    disabled?: boolean;
    label?: string;
    onChange?: (value: string) => void;
    options: Array<{ value: string }>;
    value?: string;
  }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(options[0]?.value)}
    >
      {label}:{value ?? 'empty'}
    </button>
  ),
}));

const mockedUseDashboardPresets = useDashboardPresets as jest.Mock;
const mockedUseSnackBar = useSnackBar as jest.Mock;
const enqueueErrorSnackBar = jest.fn();
const testTheme = {
  spacing: (value: number) => `${value * 4}px`,
};

i18n.load('en', {});
i18n.activate('en');

const getWrapper =
  () =>
  ({ children }: PropsWithChildren) => {
    const jotaiStore = createStore();

    return (
      <JotaiProvider store={jotaiStore}>
        <I18nProvider i18n={i18n}>
          <ThemeProvider theme={testTheme}>
            <MemoryRouter
              future={{
                v7_relativeSplatPath: true,
                v7_startTransition: true,
              }}
            >
              {children}
            </MemoryRouter>
          </ThemeProvider>
        </I18nProvider>
      </JotaiProvider>
    );
  };

describe('DashboardFilterBar', () => {
  beforeEach(() => {
    mockedUseSnackBar.mockReturnValue({
      enqueueErrorSnackBar,
    });
  });

  it('should render all filters disabled while presets are loading', () => {
    mockedUseDashboardPresets.mockReturnValue({
      presets: [],
      loading: true,
      renamePreset: jest.fn(),
      deletePreset: jest.fn(),
    });

    render(<DashboardFilterBar dashboardId="dashboard-a" />, {
      wrapper: getWrapper(),
    });

    expect(screen.getByRole('button', { name: 'Owner:empty' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Date Range:empty' }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Stage:empty' })).toBeDisabled();
  });

  it('should update the owner filter for the current dashboard', () => {
    mockedUseDashboardPresets.mockReturnValue({
      presets: [],
      loading: false,
      renamePreset: jest.fn(),
      deletePreset: jest.fn(),
    });

    render(<DashboardFilterBar dashboardId="dashboard-a" />, {
      wrapper: getWrapper(),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Owner:empty' }));

    expect(
      screen.getByRole('button', { name: 'Owner:sales-team' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Date Range:empty' }),
    ).toBeVisible();
  });

  it('should show rename and delete controls for an editable selected preset', () => {
    mockedUseDashboardPresets.mockReturnValue({
      presets: [
        {
          id: 'preset-1',
          name: 'Owned Pipeline Preset',
          canEdit: true,
          filterState: {
            ownerId: 'sales-team',
          },
        },
      ],
      loading: false,
      renamePreset: jest.fn(),
      deletePreset: jest.fn(),
    });

    render(<DashboardFilterBar dashboardId="dashboard-a" />, {
      wrapper: getWrapper(),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Preset:empty' }));

    expect(screen.getByRole('button', { name: 'Rename Preset' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Delete Preset' })).toBeVisible();
  });

  it('should hide rename and delete controls for a read-only selected preset', () => {
    mockedUseDashboardPresets.mockReturnValue({
      presets: [
        {
          id: 'preset-1',
          name: 'Shared Revenue Preset',
          canEdit: false,
          filterState: {
            ownerId: 'sales-team',
          },
        },
      ],
      loading: false,
      renamePreset: jest.fn(),
      deletePreset: jest.fn(),
    });

    render(<DashboardFilterBar dashboardId="dashboard-a" />, {
      wrapper: getWrapper(),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Preset:empty' }));

    expect(
      screen.queryByRole('button', { name: 'Rename Preset' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete Preset' }),
    ).not.toBeInTheDocument();
  });
});
