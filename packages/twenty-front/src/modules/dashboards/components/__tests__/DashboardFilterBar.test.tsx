import { DashboardFilterBar } from '@/dashboards/components/DashboardFilterBar';
import { useDashboardFilters } from '@/dashboards/hooks/useDashboardFilters';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  THEME_LIGHT,
  ThemeContextProvider,
  ThemeProvider,
} from 'twenty-ui/theme';
import { ViewFilterOperand } from 'twenty-shared/types';

jest.mock('@/dashboards/hooks/useDashboardFilters', () => ({
  useDashboardFilters: jest.fn(),
}));

const mockedUseDashboardFilters = jest.mocked(useDashboardFilters);

const renderFilterBar = () =>
  render(
    <ThemeProvider theme={THEME_LIGHT}>
      <ThemeContextProvider theme={THEME_LIGHT}>
        <DashboardFilterBar />
      </ThemeContextProvider>
    </ThemeProvider>,
  );

describe('DashboardFilterBar', () => {
  it('pushes encoded share URL into browser history', async () => {
    mockedUseDashboardFilters.mockReturnValue({
      recordFilters: [
        {
          id: 'f1',
          fieldMetadataId: 'status',
          value: 'won',
          displayValue: 'won',
          type: 'TEXT',
          operand: ViewFilterOperand.IS,
          label: 'status',
        },
      ],
      recordFilterGroups: [],
      addFilter: jest.fn(),
      removeFilter: jest.fn(),
    } as never);

    const pushStateSpy = jest.spyOn(window.history, 'pushState');

    renderFilterBar();

    await userEvent.click(screen.getByText('Share dashboard filters'));

    expect(pushStateSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('dashboard-share-url')).toHaveTextContent(
      'filter%5Bstatus%5D%5Bis%5D=won',
    );
  });
});
