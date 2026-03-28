import { DashboardFilterBar } from '@/page-layout/components/DashboardFilterBar';
import { PageLayoutTestWrapper } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('DashboardFilterBar', () => {
  it('should reopen editable criteria when clicking a filter chip', async () => {
    const user = userEvent.setup();

    render(<DashboardFilterBar />, {
      wrapper: PageLayoutTestWrapper,
    });

    await user.click(screen.getByRole('button', { name: 'Add filter' }));

    const filterChip = screen.getByRole('button', {
      name: /Name contains/i,
    });

    await user.click(filterChip);

    expect(screen.getByLabelText('Field')).toHaveValue('name');
    expect(screen.getByLabelText('Value')).toHaveValue('');
    expect(
      screen.getByRole('button', { name: 'Apply filter' }),
    ).toBeInTheDocument();
  });
});
