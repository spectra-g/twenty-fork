import { DashboardFilterBar } from '@/dashboards/components/DashboardFilterBar';
import { useDashboardPresets } from '@/dashboards/hooks/useDashboardPresets';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ThemeProvider } from '@emotion/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { type PropsWithChildren } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

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
    value?: string | null;
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

const LocationProbe = () => {
  const location = useLocation();

  return (
    <div data-testid="location-search">
      {`${location.pathname}${location.search}`}
    </div>
  );
};

const getWrapper =
  (initialEntry: string) =>
  ({ children }: PropsWithChildren) => {
    const jotaiStore = createStore();

    return (
      <JotaiProvider store={jotaiStore}>
        <I18nProvider i18n={i18n}>
          <ThemeProvider theme={testTheme}>
            <MemoryRouter
              initialEntries={[initialEntry]}
              future={{
                v7_relativeSplatPath: true,
                v7_startTransition: true,
              }}
            >
              <Routes>
                <Route
                  path="/dashboard/:dashboardId"
                  element={
                    <>
                      {children}
                      <LocationProbe />
                    </>
                  }
                />
              </Routes>
            </MemoryRouter>
          </ThemeProvider>
        </I18nProvider>
      </JotaiProvider>
    );
  };

describe('DashboardFilterBar URL effects', () => {
  beforeEach(() => {
    mockedUseDashboardPresets.mockReturnValue({
      loading: false,
      presets: [],
      renamePreset: jest.fn(),
      deletePreset: jest.fn(),
    });
    mockedUseSnackBar.mockReturnValue({
      enqueueErrorSnackBar,
    });
    enqueueErrorSnackBar.mockClear();
  });

  it('should sync dashboard filters to human-readable query params', () => {
    render(<DashboardFilterBar dashboardId="dashboard-a" />, {
      wrapper: getWrapper('/dashboard/dashboard-a'),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Owner:empty' }));

    expect(screen.getByTestId('location-search')).toHaveTextContent(
      '/dashboard/dashboard-a?filter%5BownerId%5D%5BIS%5D=sales-team',
    );
  });

  it('should hydrate dashboard filters from the url on load', () => {
    render(<DashboardFilterBar dashboardId="dashboard-a" />, {
      wrapper: getWrapper(
        '/dashboard/dashboard-a?filter%5BownerId%5D%5BIS%5D=sales-team',
      ),
    });

    expect(
      screen.getByRole('button', { name: 'Owner:sales-team' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Date Range:empty' }),
    ).toBeVisible();
  });

  it('should let url filters override preset defaults on load', () => {
    mockedUseDashboardPresets.mockReturnValue({
      loading: false,
      presets: [
        {
          id: 'preset-1',
          name: 'Preset 1',
          canEdit: false,
          filterState: {
            ownerId: 'sales-team',
            dateRange: 'last-30-days',
            stageId: 'qualified',
          },
        },
      ],
    });

    render(<DashboardFilterBar dashboardId="dashboard-a" />, {
      wrapper: getWrapper(
        '/dashboard/dashboard-a?presetId=preset-1&filter%5BdateRange%5D%5BIS%5D=last-7-days',
      ),
    });

    expect(
      screen.getByRole('button', { name: 'Owner:sales-team' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Date Range:last-7-days' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Stage:qualified' }),
    ).toBeVisible();
  });

  it('should clear malformed dashboard filters from the url and show a snackbar', () => {
    render(<DashboardFilterBar dashboardId="dashboard-a" />, {
      wrapper: getWrapper(
        '/dashboard/dashboard-a?filter%5BownerId%5D=sales-team',
      ),
    });

    expect(screen.getByRole('button', { name: 'Owner:empty' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Date Range:empty' }),
    ).toBeVisible();
    expect(screen.getByTestId('location-search')).toHaveTextContent(
      '/dashboard/dashboard-a',
    );
    expect(enqueueErrorSnackBar).toHaveBeenCalledWith({
      message: 'Shared filters could not be applied',
      options: {
        dedupeKey: 'dashboard-invalid-shared-filters',
      },
    });
  });

  it('should clear an expired preset id from the url and show a snackbar', () => {
    render(<DashboardFilterBar dashboardId="dashboard-a" />, {
      wrapper: getWrapper('/dashboard/dashboard-a?presetId=missing-preset'),
    });

    expect(screen.getByRole('button', { name: 'Owner:empty' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Date Range:empty' }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Stage:empty' })).toBeVisible();
    expect(screen.getByTestId('location-search')).toHaveTextContent(
      '/dashboard/dashboard-a',
    );
    expect(enqueueErrorSnackBar).toHaveBeenCalledWith({
      message: 'Shared filters could not be applied',
      options: {
        dedupeKey: 'dashboard-invalid-shared-filters',
      },
    });
  });

  it('should keep valid direct filters when an expired preset id is removed', () => {
    render(<DashboardFilterBar dashboardId="dashboard-a" />, {
      wrapper: getWrapper(
        '/dashboard/dashboard-a?presetId=missing-preset&filter%5BownerId%5D%5BIS%5D=sales-team',
      ),
    });

    expect(
      screen.getByRole('button', { name: 'Owner:sales-team' }),
    ).toBeVisible();
    expect(screen.getByTestId('location-search')).toHaveTextContent(
      '/dashboard/dashboard-a?filter%5BownerId%5D%5BIS%5D=sales-team',
    );
    expect(enqueueErrorSnackBar).toHaveBeenCalledWith({
      message: 'Shared filters could not be applied',
      options: {
        dedupeKey: 'dashboard-invalid-shared-filters',
      },
    });
  });
});
