import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DashboardFilterBar } from '@/dashboard/components/DashboardFilterBar';
import { DashboardFilterProvider } from '@/dashboard/contexts/DashboardFilterContext';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { type DashboardPreset } from '@/dashboard/types/DashboardPreset';

jest.mock('@/views/components/SortOrFilterChip', () => ({
  SortOrFilterChip: ({
    labelKey,
    labelValue,
    onRemove,
    testId,
  }: {
    labelKey?: string;
    labelValue: string;
    onRemove: () => void;
    testId?: string;
  }) => (
    <div data-testid={testId}>
      <span>{labelKey}</span>
      <span>{labelValue}</span>
      <button data-testid={`remove-icon-${testId}`} onClick={onRemove}>
        Remove
      </button>
    </div>
  ),
}));
jest.mock('@/object-metadata/hooks/useObjectMetadataItemById');

const q4FocusPreset: DashboardPreset = {
  id: 'preset-q4-focus',
  name: 'Q4 Focus',
  filters: [
    {
      id: 'dashboard-global-filter-closed',
      fieldMetadataId: 'dashboard-global-filter-field-id',
      value: 'CLOSED',
      displayValue: 'Closed',
      operand: RecordFilterOperand.IS,
      type: 'TEXT',
      label: 'Status',
    },
  ],
  filterGroups: [],
  createdAt: '2026-04-02T00:00:00.000Z',
  updatedAt: '2026-04-02T00:00:00.000Z',
};

const renderDashboardFilterBar = ({
  initialPresets = [],
}: {
  initialPresets?: DashboardPreset[];
} = {}) =>
  render(
    <DashboardFilterProvider initialPresets={initialPresets}>
      <DashboardFilterBar objectMetadataItemId="opportunity-object-id" />
    </DashboardFilterProvider>,
  );

describe('DashboardFilterBar', () => {
  beforeEach(() => {
    (useObjectMetadataItemById as jest.Mock).mockReturnValue({
      objectMetadataItem: {
        fields: [
          {
            id: 'status-field-id',
            name: 'status',
            label: 'Status',
            type: 'TEXT',
          },
        ],
      },
    });
  });

  it('saves the current filters as a named preset', async () => {
    const user = userEvent.setup();

    renderDashboardFilterBar();

    await user.click(screen.getByTestId('dashboard-filter-toggle'));
    await user.click(screen.getByRole('button', { name: 'Presets' }));
    await user.click(screen.getByRole('button', { name: 'Save Preset' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Preset name' }),
      'My Preset',
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      screen.getByRole('button', { name: 'My Preset' }),
    ).toBeInTheDocument();
  });

  it('applies a saved preset to the dashboard filters', async () => {
    const user = userEvent.setup();

    renderDashboardFilterBar({ initialPresets: [q4FocusPreset] });

    await user.click(screen.getByRole('button', { name: 'Presets' }));
    await user.click(screen.getByRole('button', { name: 'Q4 Focus' }));

    expect(screen.getByText('Closed')).toBeInTheDocument();
    expect(
      screen.queryByTestId('dashboard-filter-toggle'),
    ).not.toBeInTheDocument();
  });

  it('saves and reapplies an empty preset state', async () => {
    const user = userEvent.setup();

    renderDashboardFilterBar();

    await user.click(screen.getByRole('button', { name: 'Presets' }));
    await user.click(screen.getByRole('button', { name: 'Save Preset' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Preset name' }),
      'Empty Preset',
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await user.click(screen.getByTestId('dashboard-filter-toggle'));
    await user.click(screen.getByRole('button', { name: 'Empty Preset' }));

    expect(screen.getByTestId('dashboard-filter-toggle')).toBeInTheDocument();
    expect(
      screen.queryByTestId('remove-icon-dashboard-global-filter'),
    ).not.toBeInTheDocument();
  });
});
