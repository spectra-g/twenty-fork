import { DashboardFilterBar } from '@/page-layout/components/DashboardFilterBar';
import { PageLayoutTestWrapper } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('DashboardFilterBar', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

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

  it('should save the current dashboard filters as a preset and list it in the picker', async () => {
    const user = userEvent.setup();

    render(<DashboardFilterBar />, {
      wrapper: PageLayoutTestWrapper,
    });

    await user.click(screen.getByRole('button', { name: 'Add filter' }));
    await user.type(screen.getByLabelText('Value'), 'Apple');
    await user.click(screen.getByRole('button', { name: 'Apply filter' }));

    await user.click(screen.getByRole('button', { name: 'Filter presets' }));
    await user.click(screen.getByRole('button', { name: 'Save as preset' }));
    await user.type(screen.getByLabelText('Preset name'), 'Q1 Sales');
    await user.click(screen.getByRole('button', { name: 'Save preset' }));

    await user.click(screen.getByRole('button', { name: 'Filter presets' }));

    expect(
      screen.getByRole('button', { name: 'Apply preset Q1 Sales' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Filter presets' }),
    ).toHaveTextContent('Q1 Sales');
  });

  it('should disable preset save when the preset name is empty or whitespace only', async () => {
    const user = userEvent.setup();

    render(<DashboardFilterBar />, {
      wrapper: PageLayoutTestWrapper,
    });

    await user.click(screen.getByRole('button', { name: 'Filter presets' }));
    await user.click(screen.getByRole('button', { name: 'Save as preset' }));

    expect(screen.getByText('Preset name is required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save preset' })).toBeDisabled();

    await user.type(screen.getByLabelText('Preset name'), '   ');

    expect(screen.getByText('Preset name is required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save preset' })).toBeDisabled();
  });
});
