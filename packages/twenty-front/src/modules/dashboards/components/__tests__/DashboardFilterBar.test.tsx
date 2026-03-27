import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  DashboardFilterBar,
  type DashboardStageFilterDefinition,
} from '@/dashboards/components/DashboardFilterBar';

const stageFilterDefinition: DashboardStageFilterDefinition = {
  id: 'stage',
  type: 'stage',
  label: 'Stage',
  options: [
    {
      value: 'qualified',
      label: 'Qualified',
    },
    {
      value: 'proposal',
      label: 'Proposal',
    },
  ],
};

const dateFilterDefinition: DashboardStageFilterDefinition = {
  id: 'created-at',
  type: 'date',
  label: 'Created at',
  options: [],
};

describe('DashboardFilterBar', () => {
  it('should render a stage filter control when a stage definition is provided', () => {
    render(<DashboardFilterBar filterDefinitions={[stageFilterDefinition]} />);

    expect(
      screen.getByRole('combobox', { name: 'Stage filter' }),
    ).toBeVisible();
  });

  it('should show the selected stage as an active filter chip', async () => {
    const user = userEvent.setup();

    render(<DashboardFilterBar filterDefinitions={[stageFilterDefinition]} />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Stage filter' }),
      'qualified',
    );

    expect(
      screen.getByRole('button', { name: 'Stage Qualified' }),
    ).toBeVisible();
  });

  it('should save the active stage filter as a named preset and select it', async () => {
    const user = userEvent.setup();

    render(<DashboardFilterBar filterDefinitions={[stageFilterDefinition]} />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Stage filter' }),
      'qualified',
    );
    await user.click(screen.getByRole('button', { name: 'Save as Preset' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Preset name' }),
      'Sales Stage',
    );
    await user.click(
      screen.getByRole('button', { name: 'Confirm Save Preset' }),
    );

    expect(screen.getByRole('combobox', { name: 'Preset picker' })).toHaveValue(
      'sales-stage',
    );
    expect(screen.getByRole('option', { name: 'Sales Stage' })).toBeVisible();
  });

  it('should render an empty bar when no filter definitions are available', () => {
    render(<DashboardFilterBar filterDefinitions={[]} />);

    expect(screen.getByTestId('dashboard-filter-bar')).toBeVisible();
    expect(
      screen.queryByRole('combobox', { name: 'Stage filter' }),
    ).not.toBeInTheDocument();
  });

  it('should ignore non-stage filter definitions', () => {
    render(<DashboardFilterBar filterDefinitions={[dateFilterDefinition]} />);

    expect(screen.getByTestId('dashboard-filter-bar')).toBeVisible();
    expect(
      screen.queryByRole('combobox', { name: 'Created at filter' }),
    ).not.toBeInTheDocument();
  });
});
