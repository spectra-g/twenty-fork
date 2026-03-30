import { DashboardFilterBar } from '@/dashboards/components/DashboardFilterBar';
import { useDashboardPresets } from '@/dashboards/hooks/useDashboardPresets';
import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { type PropsWithChildren } from 'react';
import { THEME_LIGHT } from 'twenty-ui/theme';

jest.mock('@/dashboards/hooks/useDashboardPresets');
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

const getWrapper =
  () =>
  ({ children }: PropsWithChildren) => {
    const jotaiStore = createStore();

    return (
      <JotaiProvider store={jotaiStore}>
        <ThemeProvider theme={THEME_LIGHT}>{children}</ThemeProvider>
      </JotaiProvider>
    );
  };

describe('DashboardFilterBar', () => {
  it('should render all filters disabled while presets are loading', () => {
    mockedUseDashboardPresets.mockReturnValue({
      presets: [],
      loading: true,
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
});
