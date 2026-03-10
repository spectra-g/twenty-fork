import { DashboardFilterPresetDropdown } from '@/dashboards/components/DashboardFilterPresetDropdown';
import { useDashboardFilters } from '@/dashboards/hooks/useDashboardFilters';
import { render, screen } from '@testing-library/react';
import {
  THEME_LIGHT,
  ThemeContextProvider,
  ThemeProvider,
} from 'twenty-ui/theme';

jest.mock('@/dashboards/hooks/useDashboardFilters', () => ({
  useDashboardFilters: jest.fn(),
}));

const mockedUseDashboardFilters = jest.mocked(useDashboardFilters);

const renderDropdown = () =>
  render(
    <ThemeProvider theme={THEME_LIGHT}>
      <ThemeContextProvider theme={THEME_LIGHT}>
        <DashboardFilterPresetDropdown />
      </ThemeContextProvider>
    </ThemeProvider>,
  );

describe('DashboardFilterPresetDropdown', () => {
  it('shows active preset label', () => {
    mockedUseDashboardFilters.mockReturnValue({
      selectedPresetId: 'baseline',
      isPresetModified: false,
      activatePreset: jest.fn(),
    } as never);

    renderDropdown();

    expect(screen.getByTestId('dashboard-preset-name')).toHaveTextContent(
      'baseline',
    );
    expect(
      screen.queryByTestId('dashboard-preset-modified-indicator'),
    ).not.toBeInTheDocument();
  });

  it('shows modified indicator when active preset diverges', () => {
    mockedUseDashboardFilters.mockReturnValue({
      selectedPresetId: 'baseline',
      isPresetModified: true,
      activatePreset: jest.fn(),
    } as never);

    renderDropdown();

    expect(
      screen.getByTestId('dashboard-preset-modified-indicator'),
    ).toHaveTextContent('modified');
  });
});
